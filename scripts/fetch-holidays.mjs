// 한국 공휴일 목록을 받아 public/holidays.json 으로 저장한다. 화면은 이 파일만 읽는다.
// - HOLIDAY_API_KEY 가 있으면 공공데이터포털 "한국천문연구원 특일 정보"(getRestDeInfo)를 쓴다.
// - 없거나 실패하면 Nager.Date(키 없음)로 대신한다. 둘 다 실패하면 종료 코드 1이며, 기존 파일은 그대로 둔다.
// 사용: node scripts/fetch-holidays.mjs [출력 경로(기본 public/holidays.json)]
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const out = process.argv[2] ?? 'public/holidays.json'
const key = (process.env.HOLIDAY_API_KEY ?? '').trim()
const thisYear = new Date().getFullYear()
const years = [thisYear, thisYear + 1]

const iso = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`

async function fromDataGoKr(year) {
  const url = new URL('https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo')
  url.searchParams.set('serviceKey', key)
  url.searchParams.set('solYear', String(year))
  url.searchParams.set('numOfRows', '100')
  url.searchParams.set('_type', 'json')
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`data.go.kr ${res.status}`)
  const body = (await res.json())?.response?.body
  const raw = body?.items?.item ?? []
  const list = Array.isArray(raw) ? raw : [raw] // 한 건이면 배열이 아니라 객체로 온다
  return list.filter((x) => x.isHoliday === 'Y').map((x) => ({ date: iso(String(x.locdate)), name: String(x.dateName) }))
}

async function fromNager(year) {
  const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KR`, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`nager ${res.status}`)
  return (await res.json()).map((x) => ({ date: x.date, name: x.localName }))
}

async function load(source, year) {
  return source === 'data.go.kr' ? fromDataGoKr(year) : fromNager(year)
}

async function collect(source) {
  const items = (await Promise.all(years.map((y) => load(source, y)))).flat()
  if (items.length === 0) throw new Error(`${source}: 결과 없음`)
  return items
}

let source = key ? 'data.go.kr' : 'nager'
let items
try {
  items = await collect(source)
} catch (e) {
  console.error(`${source} 실패: ${e.message}`)
  if (source === 'nager') process.exit(1)
  source = 'nager'
  try {
    items = await collect(source)
  } catch (e2) {
    console.error(`nager 실패: ${e2.message}`)
    process.exit(1)
  }
}

const seen = new Set()
const unique = items
  .filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.date) && !seen.has(x.date) && seen.add(x.date))
  .sort((a, b) => a.date.localeCompare(b.date))
await mkdir(dirname(out), { recursive: true })
await writeFile(out, `${JSON.stringify({ source, updated: new Date().toISOString().slice(0, 10), items: unique }, null, 2)}\n`)
console.log(`${source}: ${unique.length}개 저장 → ${out}`)

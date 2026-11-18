import { useEffect, useState } from 'react'

// 메뉴 줄 시계 왼쪽의 "다음 공휴일 D-day". 배포 때 저장된 holidays.json(scripts/fetch-holidays.mjs)만 읽는다.
// 같은 접속 안에서는 한 번만 받아 온다. 파일이 없거나 남은 공휴일이 없으면 보여 주지 않는다.
let pending
function loadHolidays() {
  pending ??= fetch(`${import.meta.env.BASE_URL}holidays.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (Array.isArray(d?.items) ? d.items : null))
    .catch(() => null)
  return pending
}

const DAY = 86400000
// 날짜끼리 하루 단위로 비교한다. (시각이나 서머타임에 영향받지 않도록 UTC 자정으로 맞춘다)
const dayNumber = (y, m, d) => Date.UTC(y, m, d) / DAY

export function nextHoliday(items, now = new Date()) {
  const today = dayNumber(now.getFullYear(), now.getMonth(), now.getDate())
  for (const h of items) {
    const [y, m, d] = h.date.split('-').map(Number)
    const diff = dayNumber(y, m - 1, d) - today
    if (diff >= 0) return { name: h.name, diff }
  }
  return null
}

export default function Holiday() {
  const [next, setNext] = useState(null)
  useEffect(() => {
    let alive = true
    loadHolidays().then((items) => alive && items && setNext(nextHoliday(items)))
    return () => {
      alive = false
    }
  }, [])
  if (!next) return null
  return (
    <span className="hm-holiday" title="다음 공휴일">
      {next.name} {next.diff === 0 ? 'D-DAY' : `D-${next.diff}`}
    </span>
  )
}

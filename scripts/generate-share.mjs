// 글마다 공유용 HTML(Open Graph)을 만든다.
// 이 블로그는 해시 주소(#/post/...)라서 카카오톡, 슬랙 등의 링크 미리보기 로봇이 글별 정보를 읽을 수 없다.
// 그래서 https://jicongjy.github.io/blog/share/<글ID>/ 에 제목, 요약, 대표 이미지를 담은 작은 HTML을 만들고,
// 사람이 열면 실제 글 화면으로 이동시킨다.
//
// 사용: node scripts/generate-share.mjs [--out dist] [--check]
//   --check : 파일은 만들지 않고, 지금 배포된 목록과 달라졌는지만 GITHUB_OUTPUT 에 changed=true|false 로 적는다.
// 필요한 환경 변수: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_DATABASE_ID(없으면 기본 데이터베이스)
import { createHash } from 'node:crypto'
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'https://jicongjy.github.io/blog'
const args = process.argv.slice(2)
const check = args.includes('--check')
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'dist'

const { VITE_FIREBASE_API_KEY: key, VITE_FIREBASE_PROJECT_ID: project, VITE_FIREBASE_DATABASE_ID: dbId } = process.env
const setOutput = (changed) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`)
  console.log(`changed=${changed}`)
}

// 카테고리 이름으로 기본 이미지를 찾는다. (src/data/categoryImages.js 와 같은 규칙)
const FALLBACK = { 기획: 'plan', planning: 'plan', plan: 'plan', 설계: 'design', design: 'design', 운영: 'ops', operations: 'ops', operation: 'ops' }

const val = (f) => f?.stringValue ?? f?.timestampValue ?? ''
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const plain = (s) =>
  String(s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/[#*_`>~\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

async function fetchPosts() {
  if (!key || !project) throw new Error('Firebase 설정값이 없습니다.')
  const db = dbId || '(default)'
  const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/${db}/documents:runQuery?key=${key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'posts' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } },
              { fieldFilter: { field: { fieldPath: 'visibility' }, op: 'EQUAL', value: { stringValue: 'public' } } },
            ],
          },
        },
      },
    }),
  })
  if (!res.ok) throw new Error(`Firestore ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const rows = await res.json()
  return rows
    .filter((r) => r.document)
    .map((r) => {
      const f = r.document.fields ?? {}
      return {
        id: r.document.name.split('/').pop(),
        title: val(f.title),
        excerpt: val(f.excerpt),
        category: val(f.category),
        thumbnail: val(f.thumbnail),
        body: val(f.body),
        createdAt: val(f.createdAt),
        updatedAt: val(f.updatedAt),
      }
    })
    .filter((p) => p.title)
    .sort((a, b) => a.id.localeCompare(b.id))
}

function imageOf(p) {
  const t = p.thumbnail.trim()
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('/')) return `https://jicongjy.github.io${t}`
  const f = FALLBACK[p.category.trim().toLowerCase()]
  return f ? `${SITE}/images/${f}.jpg` : `${SITE}/og-blog.png`
}

function page(p) {
  const url = `${SITE}/share/${p.id}/`
  const target = `${SITE}/#/post/${p.id}`
  const desc = (p.excerpt.trim() || plain(p.body)).slice(0, 150)
  const img = imageOf(p)
  const date = p.createdAt ? new Date(p.createdAt).toISOString() : ''
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)} | 기획 노트</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="기획 노트">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(img)}">
${date ? `<meta property="article:published_time" content="${date}">\n` : ''}${p.category ? `<meta property="article:section" content="${esc(p.category)}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<noscript><meta http-equiv="refresh" content="0;url=${target}"></noscript>
<script>location.replace(${JSON.stringify(target)})</script>
</head>
<body>
<p><a href="${target}">${esc(p.title)}</a></p>
</body>
</html>
`
}

async function main() {
  const posts = await fetchPosts()
  const sig = createHash('sha256').update(JSON.stringify(posts.map((p) => [p.id, p.title, p.excerpt, p.category, p.thumbnail, p.updatedAt, p.body.length]))).digest('hex')

  if (check) {
    let live = null
    try {
      const r = await fetch(`${SITE}/share/manifest.json`, { cache: 'no-store' })
      if (r.ok) live = (await r.json()).sig
    } catch {
      /* 받지 못하면 새로 만든다 */
    }
    setOutput(live === sig ? 'false' : 'true')
    return
  }

  for (const p of posts) {
    const dir = join(out, 'share', p.id)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), page(p))
  }
  mkdirSync(join(out, 'share'), { recursive: true })
  writeFileSync(join(out, 'share', 'manifest.json'), JSON.stringify({ sig, count: posts.length }))
  console.log(`공유 페이지 ${posts.length}개를 ${join(out, 'share')} 에 만들었습니다.`)
}

main().catch((e) => {
  console.error('공유 페이지 생성 실패:', e.message)
  // 배포 자체는 막지 않는다. 점검 모드에서는 안전하게 "바뀜"으로 처리하지 않고 건너뛴다.
  if (check) setOutput('false')
  process.exit(0)
})

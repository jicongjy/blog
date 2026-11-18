import { useEffect, useState } from 'react'

// 헤더 아래 명언 띠. dummyjson 명언 API(키 없음)에서 하루 한 번이 아니라 접속할 때마다 하나를 받아 오른쪽에서 왼쪽으로 흘려 보낸다.
// 화면을 옮겨 다녀도 같은 명언을 쓰도록 한 번 받은 값을 모듈 안에 보관한다. 실패하면 띠를 보여 주지 않는다.
const URL = 'https://dummyjson.com/quotes/random'
let pending

function loadQuote() {
  pending ??= fetch(URL)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && typeof d.quote === 'string' ? { text: d.quote.slice(0, 300), author: String(d.author ?? '').slice(0, 80) } : null))
    .catch(() => null)
  return pending
}

export default function QuoteBar() {
  const [q, setQ] = useState(null)
  useEffect(() => {
    let alive = true
    loadQuote().then((v) => alive && setQ(v))
    return () => {
      alive = false
    }
  }, [])

  if (!q) return null
  const line = `“${q.text}”${q.author ? `  —  ${q.author}` : ''}`
  // 글이 길수록 천천히 지나가지 않도록 길이에 비례해 시간을 정한다. (대략 초당 60px)
  const dur = Math.max(24, Math.round((line.length * 8) / 60) + 12)
  return (
    <div className="hm-quote" role="note" aria-label="오늘의 명언" title={line} style={{ '--dur': `${dur}s` }}>
      <div className="hm-quote-track">
        <span>{line}</span>
        <span aria-hidden="true">{line}</span>
      </div>
    </div>
  )
}

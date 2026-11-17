// 아주 작은 마크다운 렌더러: 제목(##, ###), 인용(>), 목록(-), 문단, **굵게**, [링크](주소), `코드`
function inline(text) {
  const parts = []
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const t = m[0]
    if (t.startsWith('**')) parts.push(<strong key={i++}>{t.slice(2, -2)}</strong>)
    else if (t.startsWith('`')) parts.push(<code key={i++}>{t.slice(1, -1)}</code>)
    else {
      const [, label, href] = t.match(/\[([^\]]+)\]\(([^)]+)\)/)
      const safe = /^(https?:|mailto:|#|\/)/.test(href) ? href : '#'
      parts.push(
        <a key={i++} href={safe} target="_blank" rel="noreferrer">
          {label}
        </a>,
      )
    }
    last = m.index + t.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export default function Markdown({ source = '' }) {
  const blocks = source.replace(/\r/g, '').split(/\n{2,}/)
  return (
    <div className="prose">
      {blocks.map((raw, i) => {
        const b = raw.trim()
        if (!b) return null
        if (b.startsWith('### ')) return <h3 key={i}>{inline(b.slice(4))}</h3>
        if (b.startsWith('## ')) return <h2 key={i}>{inline(b.slice(3))}</h2>
        if (b.startsWith('> ')) return <blockquote key={i}>{inline(b.replace(/^>\s?/gm, ''))}</blockquote>
        if (/^- /.test(b))
          return (
            <ul key={i}>
              {b.split('\n').map((l, j) => (
                <li key={j}>{inline(l.replace(/^- /, ''))}</li>
              ))}
            </ul>
          )
        return <p key={i}>{inline(b)}</p>
      })}
    </div>
  )
}

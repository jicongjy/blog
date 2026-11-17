// 썸네일. post.thumbnail(이미지 주소)이 있으면 그 이미지를, 없으면 제목·분류로 만든 표지를 보여 줍니다.
const tones = [
  { bg: '#ececec', fg: '#111' },
  { bg: '#111111', fg: '#fff' },
  { bg: '#cfcfcf', fg: '#111' },
  { bg: '#f5f5f5', fg: '#111' },
]
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

export default function Thumb({ post, no, ratio = '4 / 3' }) {
  if (post.thumbnail) {
    return (
      <div className="thumb" style={{ aspectRatio: ratio }}>
        <img src={post.thumbnail} alt="" loading="lazy" />
      </div>
    )
  }
  const t = tones[hash(post.id) % tones.length]
  return (
    <div className="thumb gen" style={{ aspectRatio: ratio, background: t.bg, color: t.fg }} aria-hidden="true">
      <span className="gen-tag">{post.tags[0] ?? 'NOTE'}</span>
      <span className="gen-no">{no}</span>
    </div>
  )
}

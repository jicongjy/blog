// 썸네일 타일. post.thumbnail(이미지 주소)이 있으면 그 이미지를, 없으면 카테고리 단어가 큰 표지를 보여 줍니다.
const tones = ['dark', 'light', 'mid']
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

export default function Tile({ post, no, ratio = '4 / 3', size = 'md' }) {
  const category = post.category || '노트'
  if (post.thumbnail) {
    return (
      <div className="tile" style={{ aspectRatio: ratio }}>
        <img src={post.thumbnail} alt="" loading="lazy" />
      </div>
    )
  }
  return (
    <div className={`tile gen ${tones[hash(category) % tones.length]} ${size}`} style={{ aspectRatio: ratio }} aria-hidden="true">
      <span className="gen-no">{no}</span>
      <span className="gen-cat">{category}</span>
    </div>
  )
}

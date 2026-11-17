import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { fmtDate } from '../lib/format.js'
import { useCategories } from '../lib/useCategories.js'
import Mascot from './Mascot.jsx'

export default function Sidebar({ posts }) {
  const { isAdmin, signOut } = useAuth()
  const [params] = useSearchParams()
  const current = params.get('c')
  const list = posts ?? []
  const [dbCats] = useCategories()
  const names = (dbCats ?? []).map((c) => c.name)
  // 등록된 카테고리를 순서대로, 아직 등록되지 않은 이름이 글에 있으면 뒤에 붙인다.
  const cats = [...new Set([...names, ...list.map((p) => p.category).filter(Boolean)])]

  return (
    <aside className="side" aria-label="사이트 탐색">
      <Link to="/" className="side-brand">
        홍지영 기획 노트
      </Link>
      <h2 className="side-h">Categories</h2>
      <nav className="side-cat" aria-label="카테고리">
        <Link to="/notes" className={!current ? 'on' : ''}>
          전체<sup>{list.length}</sup>
        </Link>
        {cats.map((c) => (
          <Link key={c} to={`/notes?c=${encodeURIComponent(c)}`} className={current === c ? 'on' : ''}>
            {c}
            <sup>{list.filter((p) => p.category === c).length}</sup>
          </Link>
        ))}
      </nav>
      <hr />
      <h2 className="side-h">Latest Notes</h2>
      <nav className="side-latest" aria-label="최신 글">
        {list.slice(0, 5).map((p) => (
          <Link key={p.id} to={`/post/${p.id}`}>
            <span className="pd">
              {fmtDate(p.createdAt)} · {p.category}
            </span>
            <span className="pt">{p.title}</span>
          </Link>
        ))}
      </nav>
      <div className="side-spacer" />
      {isAdmin ? (
        <div className="admin-box">
          <Link to="/admin/categories" className="side-link">
            카테고리 관리
          </Link>
          <Link to="/write" className="sub">
            <span>글 작성하기 ↗</span>
            <Mascot />
          </Link>
          <button type="button" onClick={signOut}>
            로그아웃
          </button>
        </div>
      ) : (
        <Link to="/write" className="sub">
          <span>글 작성하기 ↗</span>
          <Mascot />
        </Link>
      )}
    </aside>
  )
}

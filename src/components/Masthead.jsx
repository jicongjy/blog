import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Masthead() {
  const { isAdmin, signIn, signOut } = useAuth()
  return (
    <header className="masthead">
      <div className="masthead-bar">
        <Link to="/" className="brand" aria-label="첫 화면">
          홍지영<small>기획 노트</small>
        </Link>
        <nav className="nav-main" aria-label="메뉴">
          <NavLink to="/" end>
            글
          </NavLink>
          <NavLink to="/about">소개</NavLink>
          {isAdmin && <NavLink to="/write">글쓰기</NavLink>}
        </nav>
        <div className="nav-side">
          <a href="https://jicongjy.github.io/portfolio/" target="_blank" rel="noreferrer">
            포트폴리오 ↗
          </a>
          {isAdmin ? (
            <button type="button" onClick={signOut}>
              로그아웃
            </button>
          ) : (
            <button type="button" onClick={signIn}>
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

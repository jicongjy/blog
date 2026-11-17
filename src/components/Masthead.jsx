import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import Logo from './Logo.jsx'

export default function Masthead() {
  const { isAdmin, signIn, signOut } = useAuth()
  const now = new Date()
  return (
    <header className="masthead">
      <div className="masthead-bar">
        <Link to="/" className="brand" aria-label="블로그 첫 화면">
          <Logo />
          <span>Jiyoung’s Notes</span>
        </Link>
        <p className="issue" aria-hidden="true">
          Vol.01 — {now.getFullYear()}.{String(now.getMonth() + 1).padStart(2, '0')}
        </p>
        <nav aria-label="메뉴">
          <NavLink to="/" end>
            글
          </NavLink>
          <NavLink to="/about">소개</NavLink>
          {isAdmin && <NavLink to="/write">글쓰기</NavLink>}
          <a href="https://jicongjy.github.io" target="_blank" rel="noreferrer">
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
        </nav>
      </div>
      <div className="rule-double" aria-hidden="true" />
    </header>
  )
}

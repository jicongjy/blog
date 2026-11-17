import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

// 글 상세·글쓰기·로그인: 사이드바 없이 가운데 정렬 패널
export function Plain() {
  const { isAdmin, signOut } = useAuth()
  return (
    <div className="plain">
      <header className="plain-head">
        <Link to="/" className="brand">
          기획 노트
          {isAdmin && <small>관리자</small>}
        </Link>
        <nav aria-label="메뉴">
          <Link to="/">홈</Link>
          <Link to="/notes">전체 글</Link>
          {isAdmin && (
            <>
              <Link to="/write">글쓰기</Link>
              <button type="button" onClick={signOut}>
                로그아웃
              </button>
            </>
          )}
        </nav>
      </header>
      <Outlet />
      <footer className="plain-foot">© {new Date().getFullYear()} Hong Jiyoung</footer>
    </div>
  )
}

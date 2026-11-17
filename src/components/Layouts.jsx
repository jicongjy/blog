import { Link, Outlet } from 'react-router-dom'
import { usePosts } from '../lib/usePosts.js'
import { useAuth } from '../lib/auth.jsx'
import Sidebar from './Sidebar.jsx'

// 홈·목록: 왼쪽 사이드바 + 흰 패널
export function WithSidebar() {
  const posts = usePosts()
  return (
    <div className="site">
      <Sidebar posts={posts} />
      <main className="panel">
        <Outlet context={{ posts }} />
      </main>
    </div>
  )
}

// 글 상세·글쓰기·로그인: 사이드바 없이 가운데 정렬 패널
export function Plain() {
  const { isAdmin, signOut } = useAuth()
  return (
    <div className="plain">
      <header className="plain-head">
        <Link to="/" className="brand">
          홍지영 기획 노트
          {isAdmin && <small>관리자</small>}
        </Link>
        <nav aria-label="메뉴">
          <Link to="/">홈</Link>
          <Link to="/notes">전체 글</Link>
          {isAdmin ? (
            <>
              <Link to="/write">글쓰기</Link>
              <button type="button" onClick={signOut}>
                로그아웃
              </button>
            </>
          ) : (
            <a href="https://jicongjy.github.io/portfolio/" target="_blank" rel="noreferrer">
              포트폴리오 ↗
            </a>
          )}
        </nav>
      </header>
      <Outlet />
      <footer className="plain-foot">© {new Date().getFullYear()} Hong Jiyoung</footer>
    </div>
  )
}

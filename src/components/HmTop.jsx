import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeSwitch from './ThemeSwitch.jsx'
import { useAuth } from '../lib/auth.jsx'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const z = (n) => String(n).padStart(2, '0')
  return <span className="hm-clock">{`${z(now.getHours())}:${z(now.getMinutes())}:${z(now.getSeconds())}`}</span>
}

// 잡지형 화면(홈, 글 상세)이 함께 쓰는 상단 한 줄
export default function HmTop() {
  const { isAdmin, signOut } = useAuth()
  return (
    <header className="hm-top">
      <div className="hm-brandrow">
        <Link to="/" className="hm-brand">
          홍지영 기획 노트
        </Link>
        <ThemeSwitch />
      </div>
      <nav className="hm-nav" aria-label="메뉴">
        <Link to="/notes">전체 글</Link>
        {isAdmin && <Link to="/admin/categories">카테고리 관리</Link>}
        <Link to="/write">글 작성하기</Link>
        {isAdmin && (
          <button type="button" onClick={signOut}>
            로그아웃
          </button>
        )}
        <Clock />
      </nav>
    </header>
  )
}

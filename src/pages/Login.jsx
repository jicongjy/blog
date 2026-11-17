import { Link, useNavigate } from 'react-router-dom'
import Mascot from '../components/Mascot.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const go = async () => {
    await signIn()
    nav('/write')
  }
  return (
    <section className="login">
      <div className="login-copy">
        <h1 className="h1">
          Admin <span>Login.</span>
        </h1>
        <p>글쓰기와 글 관리는 관리자만 사용할 수 있습니다.</p>
      </div>
      <div className="login-box">
        <button type="button" className="google" onClick={go}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#fff" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14zM12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
          </svg>
          Google로 로그인
        </button>
        <p className="login-note">허용된 계정으로만 로그인할 수 있습니다.</p>
        <p className="login-note">지금은 Firebase 연결 전이라 버튼을 누르면 미리보기 로그인이 됩니다.</p>
        <Link to="/" className="sub">
          <span>← 첫 화면으로</span>
          <Mascot />
        </Link>
      </div>
    </section>
  )
}

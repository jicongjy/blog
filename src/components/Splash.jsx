import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { usePosts } from '../lib/usePosts.js'

const KEY = 'blog:splash'
const MIN = 800 // 최소 표시 시간
const MAX = 3000 // 아무리 오래 걸려도 이 시간 뒤에는 걷는다

function seen() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// 사이트를 처음 열 때 한 번만 보이는 덮개. 글을 불러오면 위로 걷힌다.
export default function Splash() {
  const [phase, setPhase] = useState(() => (seen() ? 'gone' : 'show')) // show, leave, gone
  const { ready } = useAuth()
  const posts = usePosts()
  const [minDone, setMinDone] = useState(false)
  const loaded = ready && posts !== null

  useEffect(() => {
    if (phase !== 'show') return undefined
    const a = setTimeout(() => setMinDone(true), MIN)
    const b = setTimeout(() => setPhase('leave'), MAX)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'show' && loaded && minDone) setPhase('leave')
  }, [phase, loaded, minDone])

  useEffect(() => {
    if (phase !== 'leave') return undefined
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* 무시 */
    }
    const t = setTimeout(() => setPhase('gone'), 700)
    return () => clearTimeout(t)
  }, [phase])

  // 덮개가 떠 있는 동안 아래 화면이 스크롤되지 않게 한다.
  useEffect(() => {
    if (phase === 'gone') return undefined
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [phase])

  if (phase === 'gone') return null
  return (
    <div className={`splash${phase === 'leave' ? ' leave' : ''}`} role="status" aria-label="불러오는 중">
      <div className="splash-in">
        <span className="ld-dot" />
        <p>기획 노트</p>
      </div>
    </div>
  )
}

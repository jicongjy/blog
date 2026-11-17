// 로그인 상태. Firebase 설정이 있으면 Google 로그인, 없으면 화면 확인용 미리보기 로그인.
// 화면의 관리자 표시는 편의용이며, 실제 쓰기 권한은 firestore.rules 가 막는다.
import { createContext, useContext, useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { ADMIN_EMAIL, auth, firebaseEnabled } from './firebase.js'

const AuthContext = createContext(null)
const PREVIEW_KEY = 'blog:auth:preview'

const isAllowed = (u) => Boolean(u && u.emailVerified && ADMIN_EMAIL && u.email?.toLowerCase() === ADMIN_EMAIL)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!firebaseEnabled)

  useEffect(() => {
    if (!firebaseEnabled) {
      try {
        if (localStorage.getItem(PREVIEW_KEY)) setUser({ name: '미리보기', preview: true })
      } catch {
        /* 무시 */
      }
      return undefined
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)
    })
  }, [])

  const signIn = async () => {
    if (!firebaseEnabled) {
      try {
        localStorage.setItem(PREVIEW_KEY, '1')
      } catch {
        /* 무시 */
      }
      setUser({ name: '미리보기', preview: true })
      return { ok: true }
    }
    try {
      const { user: u } = await signInWithPopup(auth, new GoogleAuthProvider())
      if (!isAllowed(u)) {
        await fbSignOut(auth)
        return { ok: false, reason: 'not-admin' }
      }
      return { ok: true }
    } catch (e) {
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return { ok: false, reason: 'cancelled' }
      return { ok: false, reason: 'error', message: e?.code }
    }
  }

  const signOut = async () => {
    if (!firebaseEnabled) {
      try {
        localStorage.removeItem(PREVIEW_KEY)
      } catch {
        /* 무시 */
      }
      setUser(null)
      return
    }
    await fbSignOut(auth)
  }

  const isAdmin = firebaseEnabled ? isAllowed(user) : Boolean(user)
  return <AuthContext.Provider value={{ user, ready, isAdmin, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

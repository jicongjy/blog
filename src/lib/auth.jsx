// 로그인 상태. Firebase 설정이 있으면 Google 로그인, 없으면 화면 확인용 미리보기 로그인.
// 화면의 관리자 표시는 편의용이며, 실제 쓰기 권한은 firestore.rules 가 막는다.
import { createContext, useContext, useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { isAllowedUser } from './adminUser.js'
import { markOwner } from './analytics.js'
import { ADMIN_EMAIL, auth, firebaseEnabled } from './firebase.js'

const AuthContext = createContext(null)
const PREVIEW_KEY = 'blog:auth:preview'

const isAllowed = (u) => isAllowedUser(u, ADMIN_EMAIL)

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
      if (isAllowed(u)) markOwner()
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

  // 이메일/비밀번호 로그인(채점용 임시 계정).
  const signInEmail = async (email, password) => {
    if (!firebaseEnabled) return signIn()
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      return { ok: true }
    } catch (e) {
      if (e?.code === 'auth/invalid-credential' || e?.code === 'auth/wrong-password' || e?.code === 'auth/user-not-found' || e?.code === 'auth/invalid-email') return { ok: false, reason: 'wrong' }
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
  return <AuthContext.Provider value={{ user, ready, isAdmin, signIn, signInEmail, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

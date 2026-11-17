// 로그인 상태. 지금은 화면 확인용 임시 구현입니다.
// Firebase를 붙일 때 signIn/signOut/user 를 Google 로그인으로 바꿉니다.
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const KEY = 'blog:auth:preview'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return localStorage.getItem(KEY) ? { name: '홍지영', preview: true } : null
    } catch {
      return null
    }
  })

  const signIn = async () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* 무시 */
    }
    setUser({ name: '홍지영', preview: true })
  }
  const signOut = async () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* 무시 */
    }
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isAdmin: !!user, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

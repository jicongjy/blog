import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { initAnalytics, pageView } from './lib/analytics.js'
import { AuthProvider } from './lib/auth.jsx'
import { Plain } from './components/Layouts.jsx'
import Home from './pages/Home.jsx'
import List from './pages/List.jsx'
import Post from './pages/Post.jsx'
import Editor from './pages/Editor.jsx'
import Categories from './pages/Categories.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // 방문 집계(GA4). 글 상세는 글 제목을 알아야 해서 Post 화면에서 따로 보낸다.
  useEffect(() => {
    initAnalytics()
  }, [])
  useEffect(() => {
    if (pathname.startsWith('/post/') || pathname.startsWith('/write') || pathname.startsWith('/admin') || pathname === '/login') return
    pageView(pathname === '/' ? '/' : pathname, pathname === '/notes' ? '전체 글' : '홈', { page_type: pathname === '/notes' ? 'list' : 'home' })
  }, [pathname])
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/notes" element={<List />} />
        <Route element={<Plain />}>
          <Route path="/write" element={<Editor />} />
          <Route path="/write/:id" element={<Editor />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </AuthProvider>
  )
}

import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { initAnalytics, pageView } from './lib/analytics.js'
import { AuthProvider } from './lib/auth.jsx'
import Splash from './components/Splash.jsx'
import { Plain } from './components/Layouts.jsx'
import Home from './pages/Home.jsx'
import List from './pages/List.jsx'
import Post from './pages/Post.jsx'
import Editor from './pages/Editor.jsx'
import Categories from './pages/Categories.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'

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
    // 홈과 전체 글만 여기서 보낸다. 글 상세는 Post 화면에서, 없는 주소(404)는 집계하지 않는다.
    const path = pathname.replace(/\/+$/, '') || '/' // /notes/ 처럼 끝에 슬래시가 붙어도 같은 화면으로 본다
    if (path !== '/' && path !== '/notes') return
    pageView(path, path === '/notes' ? '전체 글' : '홈', { page_type: path === '/notes' ? 'list' : 'home' })
  }, [pathname])
  return (
    <AuthProvider>
      <Splash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/notes" element={<List />} />
        <Route path="/write" element={<Editor />} />
        <Route path="/write/:id" element={<Editor />} />
        <Route element={<Plain />}>
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

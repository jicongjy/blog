import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import { Plain, WithSidebar } from './components/Layouts.jsx'
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
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<Post />} />
        <Route element={<WithSidebar />}>
          <Route path="/notes" element={<List />} />
        </Route>
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

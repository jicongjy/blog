import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import Masthead from './components/Masthead.jsx'
import Home from './pages/Home.jsx'
import Post from './pages/Post.jsx'
import Editor from './pages/Editor.jsx'
import About from './pages/About.jsx'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <AuthProvider>
      <Masthead />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/write" element={<Editor />} />
          <Route path="/write/:id" element={<Editor />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Hong Jiyoung</span>
      </footer>
    </AuthProvider>
  )
}

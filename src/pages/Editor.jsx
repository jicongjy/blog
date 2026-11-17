import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown.jsx'
import { getPost, savePost } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'

const empty = { title: '', excerpt: '', tags: '', body: '' }

export default function Editor() {
  const { id } = useParams()
  const nav = useNavigate()
  const { isAdmin, signIn } = useAuth()
  const [f, setF] = useState(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getPost(id).then((p) => p && setF({ title: p.title, excerpt: p.excerpt, tags: p.tags.join(', '), body: p.body }))
  }, [id])

  if (!isAdmin)
    return (
      <section className="hero">
        <p className="eyebrow">글쓰기</p>
        <h1>
          로그인하면 <em>쓸 수 있어요.</em>
        </h1>
        <button type="button" className="btn" onClick={signIn}>
          로그인
        </button>
      </section>
    )

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const submit = async (status) => {
    if (!f.title.trim()) return window.alert('제목을 입력해 주세요.')
    setSaving(true)
    const saved = await savePost({
      id,
      title: f.title.trim(),
      excerpt: f.excerpt.trim(),
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
      body: f.body,
      status,
    })
    nav(`/post/${saved.id}`)
  }

  return (
    <section className="editor">
      <header className="editor-head">
        <p className="eyebrow">{id ? '글 수정' : '새 글'}</p>
        <div className="editor-actions">
          <Link to={id ? `/post/${id}` : '/'}>취소</Link>
          <button type="button" className="btn ghost" disabled={saving} onClick={() => submit('draft')}>
            임시저장
          </button>
          <button type="button" className="btn" disabled={saving} onClick={() => submit('published')}>
            발행
          </button>
        </div>
      </header>
      <div className="editor-grid">
        <div className="editor-form">
          <input className="f-title" placeholder="제목" value={f.title} onChange={set('title')} />
          <textarea className="f-excerpt" rows={2} placeholder="한 줄 요약 (목록과 글 머리에 표시)" value={f.excerpt} onChange={set('excerpt')} />
          <input className="f-tags" placeholder="태그 (쉼표로 구분)" value={f.tags} onChange={set('tags')} />
          <textarea className="f-body" placeholder={'본문 (마크다운)\n\n## 소제목\n> 강조하고 싶은 문장\n- 목록'} value={f.body} onChange={set('body')} />
        </div>
        <div className="editor-preview">
          <p className="eyebrow">미리보기</p>
          <h2 className="pv-title">{f.title || '제목'}</h2>
          <p className="deck">{f.excerpt}</p>
          <Markdown source={f.body} />
        </div>
      </div>
    </section>
  )
}

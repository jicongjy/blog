import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import HmTop from '../components/HmTop.jsx'
import RichEditor from '../components/RichEditor.jsx'
import { heroImage, postFallback } from '../data/categoryImages.js'
import { getPost, savePost } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
import { toHtml } from '../lib/body.js'
import { useCategories } from '../lib/useCategories.js'

const empty = { title: '', excerpt: '', category: '', thumbnail: '', visibility: 'public', body: '' }

export default function Editor() {
  const { id } = useParams()
  const nav = useNavigate()
  const { isAdmin, ready } = useAuth()
  const [f, setF] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [cats] = useCategories()

  // 홈, 글 상세와 같은 화면 바탕을 쓴다.
  useEffect(() => {
    document.body.classList.add('is-home')
    return () => document.body.classList.remove('is-home')
  }, [])

  useEffect(() => {
    if (!id) return
    getPost(id).then((p) => {
      if (p) setF({ title: p.title, excerpt: p.excerpt, category: p.category ?? '', thumbnail: p.thumbnail ?? '', visibility: p.visibility ?? 'public', body: toHtml(p.body) })
      setLoaded(true)
    })
  }, [id])

  if (!ready) return null
  if (!isAdmin)
    return (
      <div className="hm">
        <HmTop />
        <div className="pd-missing">
          <h1 className="pd-title">로그인이 필요합니다.</h1>
          <p>
            <Link to="/login">관리자 로그인</Link>
          </p>
        </div>
      </div>
    )

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const names = [...new Set([...(cats ?? []).map((c) => c.name), f.category].filter(Boolean))]
  const category = f.category || names[0] || ''

  const submit = async (status) => {
    if (!f.title.trim()) return window.alert('제목을 입력해 주세요.')
    if (!category) return window.alert('카테고리를 먼저 만들어 주세요.')
    setSaving(true)
    const saved = await savePost({
      id,
      title: f.title.trim(),
      excerpt: f.excerpt.trim(),
      category,
      thumbnail: f.thumbnail.trim(),
      visibility: f.visibility,
      body: f.body,
      status,
    })
    nav(`/post/${saved.id}`)
  }

  const cover = f.thumbnail.trim() || postFallback(category, names.indexOf(category)) || heroImage

  return (
    <div className="hm pd ed">
      <HmTop />

      <div className="pd-cols">
        <aside className="pd-toc ed-side" aria-label="글 설정">
          <p className="hm-label">{id ? 'Edit' : 'Write'}</p>

          <div className="ed-field">
            <label htmlFor="ed-cat" className="ed-lbl">
              카테고리 · <Link to="/admin/categories">관리</Link>
            </label>
            <select id="ed-cat" value={category} onChange={set('category')}>
              {names.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="ed-field">
            <span className="ed-lbl">공개 설정</span>
            <div className="ed-seg" role="radiogroup" aria-label="공개 설정">
              <button type="button" role="radio" aria-checked={f.visibility === 'public'} className={f.visibility === 'public' ? 'on' : ''} onClick={() => setF((s) => ({ ...s, visibility: 'public' }))}>
                공개
              </button>
              <button type="button" role="radio" aria-checked={f.visibility === 'private'} className={f.visibility === 'private' ? 'on' : ''} onClick={() => setF((s) => ({ ...s, visibility: 'private' }))}>
                비공개
              </button>
            </div>
          </div>

          <div className="ed-field">
            <label htmlFor="ed-thumb" className="ed-lbl">
              썸네일 이미지 주소
            </label>
            <input id="ed-thumb" value={f.thumbnail} onChange={set('thumbnail')} placeholder="비우면 카테고리 이미지" />
          </div>

          <div className="ed-actions">
            <button type="button" className="hm-read" disabled={saving} onClick={() => submit('published')}>
              발행
            </button>
            <button type="button" disabled={saving} onClick={() => submit('draft')}>
              임시저장
            </button>
            <Link to={id ? `/post/${id}` : '/notes'}>취소</Link>
          </div>
        </aside>

        <div className="pd-main">
          <form onSubmit={(e) => e.preventDefault()}>
            <input className="ed-title" value={f.title} onChange={set('title')} placeholder="제목" aria-label="제목" />
            <textarea className="ed-excerpt" rows={2} value={f.excerpt} onChange={set('excerpt')} placeholder="요약 (목록과 글 상단에 표시)" aria-label="요약" />
            <div className="pd-cover">
              <img src={cover} alt="" />
            </div>
            {/* 글을 불러온 뒤에 에디터를 만들어 처음 내용이 들어가게 한다 */}
            {(!id || loaded) && <RichEditor value={f.body} onChange={(html) => setF((s) => ({ ...s, body: html }))} />}
          </form>
        </div>
      </div>
    </div>
  )
}

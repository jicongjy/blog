import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown.jsx'
import Tile from '../components/Tile.jsx'
import { getPost, savePost } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'

const empty = { title: '', excerpt: '', category: '', thumbnail: '', visibility: 'public', body: '' }

export default function Editor() {
  const { id } = useParams()
  const nav = useNavigate()
  const { isAdmin } = useAuth()
  const [f, setF] = useState(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getPost(id).then((p) => p && setF({ title: p.title, excerpt: p.excerpt, category: p.category ?? '', thumbnail: p.thumbnail ?? '', visibility: p.visibility ?? 'public', body: p.body }))
  }, [id])

  if (!isAdmin)
    return (
      <div className="post-missing">
        <h1 className="h1">
          로그인이 <span>필요합니다.</span>
        </h1>
        <Link className="btn" to="/login">
          관리자 로그인
        </Link>
      </div>
    )

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const submit = async (status) => {
    if (!f.title.trim()) return window.alert('제목을 입력해 주세요.')
    if (!f.category.trim()) return window.alert('카테고리를 입력해 주세요.')
    setSaving(true)
    const saved = await savePost({
      id,
      title: f.title.trim(),
      excerpt: f.excerpt.trim(),
      category: f.category.trim(),
      thumbnail: f.thumbnail.trim(),
      visibility: f.visibility,
      body: f.body,
      status,
    })
    nav(`/post/${saved.id}`)
  }

  return (
    <section className="editor">
      <div className="editor-top">
        <h1 className="h1 sm">
          {id ? '글' : '새 글'} <span>{id ? '수정' : '쓰기'}</span>
        </h1>
        <div className="editor-actions">
          <Link to={id ? `/post/${id}` : '/notes'}>취소</Link>
          <button type="button" className="btn soft" disabled={saving} onClick={() => submit('draft')}>
            임시저장
          </button>
          <button type="button" className="btn" disabled={saving} onClick={() => submit('published')}>
            발행
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <form className="editor-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            <span>제목</span>
            <input className="f-title" value={f.title} onChange={set('title')} />
          </label>
          <label>
            <span>요약 (목록과 글 상단에 표시)</span>
            <textarea rows={2} value={f.excerpt} onChange={set('excerpt')} />
          </label>
          <div className="row">
            <label className="grow">
              <span>카테고리</span>
              <input value={f.category} onChange={set('category')} placeholder="예: 기획" />
            </label>
            <fieldset>
              <legend>공개 설정</legend>
              <div className="seg">
                <label className={f.visibility === 'public' ? 'on' : ''}>
                  <input type="radio" name="vis" checked={f.visibility === 'public'} onChange={() => setF((s) => ({ ...s, visibility: 'public' }))} /> 공개
                </label>
                <label className={f.visibility === 'private' ? 'on' : ''}>
                  <input type="radio" name="vis" checked={f.visibility === 'private'} onChange={() => setF((s) => ({ ...s, visibility: 'private' }))} /> 비공개
                </label>
              </div>
            </fieldset>
          </div>
          <label>
            <span>썸네일 이미지 주소 (비워 두면 카테고리 표지)</span>
            <input value={f.thumbnail} onChange={set('thumbnail')} placeholder="https://" />
          </label>
          <label>
            <span>본문 (마크다운)</span>
            <textarea className="f-body" rows={13} value={f.body} onChange={set('body')} placeholder={'## 소제목\n\n본문\n\n> 인용문\n\n- 목록'} />
          </label>
        </form>

        <aside className="editor-preview" aria-label="미리보기">
          <p className="lbl">미리보기</p>
          <div className="pv">
            <p className="art-meta">{f.category || '카테고리'}</p>
            <h2>{f.title || '제목'}</h2>
            <p className="art-summary">{f.excerpt}</p>
            <Tile post={{ id: 'preview', category: f.category, thumbnail: f.thumbnail }} no="00" ratio="16 / 9" size="lg" />
            <div className="art sm">
              <Markdown source={f.body} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

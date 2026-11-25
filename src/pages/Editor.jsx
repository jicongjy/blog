import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import HmTop from '../components/HmTop.jsx'
import RichEditor from '../components/RichEditor.jsx'
import { heroImage, postFallback } from '../data/categoryImages.js'
import { getPost, savePost } from '../data/posts.js'
import { aiEnabled } from '../lib/ai.js'
import { recordCall, withFinal } from '../lib/aiUsage.js'
import { useAuth } from '../lib/auth.jsx'
import { toHtml } from '../lib/body.js'
import { checkBeforePublish } from '../lib/publishCheck.js'
import { htmlToText, MAX_CALLS, requestSuggestion } from '../lib/suggest.js'
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
  // AI 제안: idle(처음) / loading(진행 중) / success / error. 제안은 입력칸을 덮어쓰지 않고, 항목마다 쓰기를 눌러야 들어간다(D30).
  const [ai, setAi] = useState({ status: 'idle', data: null, used: {} })
  // 사용 기록(F7): 글에 저장된 기록을 이어받고, 호출이 끝날 때마다 갱신한다. 한 번도 안 썼으면 null.
  const [usage, setUsage] = useState(null)
  // 이 화면에서 이미 받은 제안. 다시 받을 때 AI에 보내 같은 답이 반복되지 않게 한다.
  const earlier = useRef([])

  // 홈, 글 상세와 같은 화면 바탕을 쓴다.
  useEffect(() => {
    document.body.classList.add('is-home')
    return () => document.body.classList.remove('is-home')
  }, [])

  useEffect(() => {
    if (!id) return
    getPost(id).then((p) => {
      if (p) setUsage(p.aiUsage ?? null)
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
    // 발행 전 점검(F2): 제목, 요약, 카테고리가 비면 발행하지 않고, 표지가 비면 알리고 확인받는다. 임시저장은 제목만 있으면 된다.
    if (status === 'published') {
      const { blocking, warnings } = checkBeforePublish({ ...f, category })
      if (blocking.length) return window.alert(`발행하려면 다음을 채워 주세요: ${blocking.join(', ')}`)
      if (warnings.length && !window.confirm('표지 이미지가 비어 있어 카테고리 이미지가 쓰입니다. 이대로 발행할까요?')) return
    } else {
      if (!f.title.trim()) return window.alert('제목을 입력해 주세요.')
      if (!category) return window.alert('카테고리를 먼저 만들어 주세요.')
    }
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
      ...(usage ? { aiUsage: withFinal(usage, { ...f, category }) } : {}),
    })
    nav(`/post/${saved.id}`)
  }

  const hasBody = htmlToText(f.body).length > 0
  const callsLeft = MAX_CALLS - (usage?.calls ?? 0)
  const canAsk = hasBody && ai.status !== 'loading' && callsLeft > 0
  const aiNote = !hasBody ? '본문을 먼저 쓰세요' : callsLeft <= 0 ? '이 글에서 쓸 수 있는 제안 횟수를 모두 썼습니다' : `제안 ${callsLeft}회 남음`

  const askAi = async () => {
    if (!canAsk) return
    setAi({ status: 'loading', data: null, used: {} })
    try {
      const data = await requestSuggestion({ title: f.title, body: f.body, categories: names, previous: earlier.current })
      earlier.current = [...earlier.current, { title: data.title, excerpt: data.excerpt }]
      setUsage((u) => recordCall(u, { ok: true, ms: data.ms, suggestion: data }))
      setAi({ status: 'success', data, used: {} })
    } catch {
      setUsage((u) => recordCall(u, { ok: false }))
      setAi({ status: 'error', data: null, used: {} })
    }
  }

  const useSuggestion = (key) => {
    setF((s) => ({ ...s, [key]: ai.data[key] }))
    setAi((a) => ({ ...a, used: { ...a.used, [key]: true } }))
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

            {aiEnabled && (
              <section className="ed-ai" aria-label="AI 제안">
                <div className="ed-ai-head">
                  <button type="button" className="ed-ai-btn" disabled={!canAsk} onClick={askAi}>
                    {ai.status === 'loading' ? '제안 만드는 중' : 'AI 제안 받기'}
                  </button>
                  <span className="ed-ai-note">{aiNote}</span>
                </div>
                {ai.status === 'error' && (
                  <p className="ed-ai-err" role="alert">
                    제안을 받지 못했습니다. 직접 입력해 주세요.
                  </p>
                )}
                {ai.status === 'success' && (
                  <ul className="ed-ai-list">
                    {[
                      ['title', '제목'],
                      ['excerpt', '요약'],
                      ['category', '카테고리'],
                    ]
                      .filter(([k]) => ai.data[k])
                      .map(([k, label]) => (
                        <li key={k}>
                          <span className="ed-ai-lbl">{label}</span>
                          <span className="ed-ai-txt">{ai.data[k]}</span>
                          <button type="button" disabled={ai.used[k]} onClick={() => useSuggestion(k)}>
                            {ai.used[k] ? '적용됨' : '쓰기'}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

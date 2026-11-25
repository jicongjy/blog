import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Body from '../components/Body.jsx'
import HmTop from '../components/HmTop.jsx'
import Loading from '../components/Loading.jsx'
import { heroImage, postFallback } from '../data/categoryImages.js'
import { getPost, removePost } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
import Reactions from '../components/Reactions.jsx'
import { categoryClick, pageView, postParams, selectArticle, track } from '../lib/analytics.js'
import { prepareBody } from '../lib/body.js'
import { fmtDate, noOf, readMinutes } from '../lib/format.js'
import { useCategories } from '../lib/useCategories.js'
import { usePosts } from '../lib/usePosts.js'

export default function Post() {
  const { id } = useParams()
  const nav = useNavigate()
  const { isAdmin } = useAuth()
  const all = usePosts()
  const [cats] = useCategories()
  const [post, setPost] = useState(undefined)
  const [active, setActive] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.body.classList.add('is-home')
    return () => document.body.classList.remove('is-home')
  }, [])

  useEffect(() => {
    getPost(id).then(setPost)
  }, [id])

  const { html, toc } = useMemo(() => prepareBody(post?.body), [post])

  // 읽고 있는 위치에 맞춰 목차의 현재 항목을 표시한다.
  useEffect(() => {
    if (toc.length === 0) return
    const onScroll = () => {
      let cur = toc[0].id
      for (const t of toc) {
        const el = document.getElementById(t.id)
        if (el && el.getBoundingClientRect().top <= 120) cur = t.id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [toc])

  // 공개된 글만 집계한다. 페이지 제목을 글 제목으로 보내서 GA에서 글별 조회수가 제목으로 보인다.
  const countable = Boolean(post) && post.status === 'published' && post.visibility !== 'private'
  useEffect(() => {
    if (!countable) return undefined
    const info = postParams(post)
    pageView(`/post/${post.id}`, post.title, { ...info, page_type: 'post' })

    // 읽기 깊이: 본문의 50%, 90% 지점을 지나면 각각 한 번만 보낸다.
    const left = [50, 90]
    // 완독: 90% 지점을 지났고, 화면이 앞에 있던 활성 시간이 읽는 시간의 40% 이상(최소 10초)일 때 한 번 보낸다.
    const need = Math.max(10, info.read_minutes * 60 * 0.4)
    const marks = [15, 30, 60, 120]
    let depth = 0
    let active = 0
    let readSent = false
    const check = () => {
      while (marks.length && active >= marks[0]) track('article_time', { ...info, engaged_seconds: marks.shift() })
      if (!readSent && depth >= 90 && active >= need) {
        readSent = true
        track('article_read', { ...info, engaged_seconds: active })
      }
    }
    const onScroll = () => {
      const el = document.querySelector('.pd-body')
      if (!el) return
      const r = el.getBoundingClientRect()
      depth = Math.max(depth, ((window.innerHeight - r.top) / r.height) * 100)
      while (left.length && depth >= left[0]) track('article_scroll', { ...info, scroll_depth: left.shift() })
      check()
    }
    // 활성 시간: 탭이 보이고 창이 선택된 상태의 초만 센다.
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        active += 1
        check()
      }
    }, 1000)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [countable, post])

  // 글 주소를 복사한다. 카카오톡, 슬랙 등에 붙여 넣으면 이 글의 제목, 요약, 대표 이미지가 미리보기로 보인다.
  const copyShare = async () => {
    track('share', { ...postParams(post), share_method: 'copy_link' })
    // 이 주소로 들어온 방문은 GA에서 소스/매체 share / copy_link 로 구분된다.
    const url = `${window.location.origin}${import.meta.env.BASE_URL}post/${post.id}/?utm_source=share&utm_medium=copy_link`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('이 주소를 복사하세요.', url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  if (post === undefined || all === null)
    return (
      <div className="hm">
        <HmTop />
        <Loading />
      </div>
    )
  const hidden = post && !isAdmin && (post.status !== 'published' || post.visibility === 'private')
  if (!post || hidden)
    return (
      <div className="hm">
        <HmTop />
        <div className="pd-missing">
          <p>글을 찾을 수 없습니다.</p>
          <Link to="/notes">← 전체 글</Link>
        </div>
      </div>
    )

  const names = [...new Set([...(cats ?? []).map((c) => c.name), ...all.map((p) => p.category).filter(Boolean)])]
  const imgOf = (p) => p.thumbnail || postFallback(p.category, names.indexOf(p.category)) || heroImage
  const related = all.filter((p) => p.id !== post.id).slice(0, 3)
  const no = all.some((p) => p.id === post.id) ? Number(noOf(all, all.find((p) => p.id === post.id))) : null

  const onDelete = async () => {
    if (!window.confirm('이 글을 삭제합니다. 되돌릴 수 없습니다.')) return
    await removePost(post.id)
    nav('/notes')
  }

  return (
    <div className="hm pd">
      <HmTop />

      <div className="pd-cols">
        <aside className="pd-toc" aria-label="목차">
          <p className="hm-label">Contents</p>
          {toc.length === 0 ? (
            <p className="pd-none">목차 없음</p>
          ) : (
            <ol>
              {toc.map((t) => (
                <li key={t.id} className={`l${t.level}${active === t.id ? ' on' : ''}`}>
                  <button type="button" onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                    {t.text}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>

        <article className="pd-main">
          <p className="pd-meta">
            <Link to={`/notes?c=${encodeURIComponent(post.category)}`} onClick={() => categoryClick(post.category, 'post_meta')}>{post.category}</Link>
            <span>{fmtDate(post.createdAt)}</span>
            <span>읽는 시간 {readMinutes(post.body)}분</span>
            {post.status === 'draft' && <span>임시저장</span>}
            {post.visibility === 'private' && <span>비공개</span>}
            {countable && (
              <button type="button" onClick={copyShare}>
                {copied ? '복사됨' : '링크 복사'}
              </button>
            )}
          </p>
          <h1 className="pd-title">{post.title}</h1>
          {post.excerpt && (
            <aside className="pd-summary" aria-label="요약">
              <span className="pd-summary-lbl">요약</span>
              <p>{post.excerpt}</p>
            </aside>
          )}
          {isAdmin && (
            <p className="pd-admin">
              <Link to={`/write/${post.id}`}>수정</Link>
              <button type="button" onClick={onDelete}>
                삭제
              </button>
            </p>
          )}

          <figure className="pd-cover">
            <img src={imgOf(post)} alt="" />
          </figure>

          <div className="pd-body">
            <Body html={html} />
          </div>
          {countable && <Reactions post={post} />}
        </article>
      </div>

      {related.length > 0 && (
        <section className="pd-next" aria-label="다음에 읽을 글">
          <p className="hm-label">Next</p>
          <div className="pd-grid">
            {related.map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="pd-card" onClick={() => selectArticle(p, 'next_article')}>
                <span className="pd-thumb">
                  <img src={imgOf(p)} alt="" loading="lazy" />
                </span>
                <span className="g">{fmtDate(p.createdAt)}</span>
                <span>{p.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="hm-foot">© {new Date().getFullYear()} 기획 노트{no ? ` · No. ${no}` : ''}</footer>
    </div>
  )
}

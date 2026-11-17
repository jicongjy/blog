import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Body from '../components/Body.jsx'
import HmTop from '../components/HmTop.jsx'
import Loading from '../components/Loading.jsx'
import { heroImage, postFallback } from '../data/categoryImages.js'
import { getPost, removePost } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
import { categoryClick, pageView, selectArticle, track } from '../lib/analytics.js'
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
    const info = { post_id: post.id, post_category: post.category }
    pageView(`/post/${post.id}`, post.title, { ...info, page_type: 'post' })
    // 읽기 깊이: 본문의 50%, 90% 지점을 지나면 각각 한 번만 보낸다.
    const left = [50, 90]
    const onScroll = () => {
      const el = document.querySelector('.pd-body')
      if (!el || left.length === 0) return
      const r = el.getBoundingClientRect()
      const depth = ((window.innerHeight - r.top) / r.height) * 100
      while (left.length && depth >= left[0]) track('article_scroll', { ...info, post_title: post.title, scroll_depth: left.shift() })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [countable, post])

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
          </p>
          <h1 className="pd-title">{post.title}</h1>
          {post.excerpt && <p className="pd-excerpt">{post.excerpt}</p>}
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

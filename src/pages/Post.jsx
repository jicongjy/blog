import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Body from '../components/Body.jsx'
import HmTop from '../components/HmTop.jsx'
import { categoryImage, heroImage } from '../data/categoryImages.js'
import { getPost, removePost } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
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

  if (post === undefined || all === null) return null
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
  const imgOf = (p) => p.thumbnail || categoryImage(p.category, names.indexOf(p.category)) || heroImage
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
            <Link to={`/notes?c=${encodeURIComponent(post.category)}`}>{post.category}</Link>
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
              <Link key={p.id} to={`/post/${p.id}`} className="pd-card">
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

      <footer className="hm-foot">© {new Date().getFullYear()} 홍지영 기획 노트{no ? ` · No. ${no}` : ''}</footer>
    </div>
  )
}

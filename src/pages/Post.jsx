import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Body from '../components/Body.jsx'
import Tile from '../components/Tile.jsx'
import { getPost, removePost } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
import { prepareBody } from '../lib/body.js'
import { fmtDate, noOf, readMinutes } from '../lib/format.js'
import { usePosts } from '../lib/usePosts.js'

export default function Post() {
  const { id } = useParams()
  const nav = useNavigate()
  const { isAdmin } = useAuth()
  const all = usePosts()
  const [post, setPost] = useState(undefined)
  const [active, setActive] = useState('')

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
      <div className="post-missing">
        <h1 className="h1">글을 찾을 수 없습니다.</h1>
        <Link className="more" to="/notes">
          ← 전체 글
        </Link>
      </div>
    )

  const related = all.filter((p) => p.id !== post.id).slice(0, 2)
  const no = all.includes(post) ? noOf(all, post) : '00'

  const onDelete = async () => {
    if (!window.confirm('이 글을 삭제합니다. 되돌릴 수 없습니다.')) return
    await removePost(post.id)
    nav('/notes')
  }

  return (
    <article>
      <div className="post-cols">
        <aside className="toc" aria-label="목차">
          <p className="toc-h">목차</p>
          {toc.length === 0 ? (
            <p className="toc-empty">이 글에는 목차가 없습니다.</p>
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

        <div className="post-main">
          <p className="art-meta">
            <Link to={`/notes?c=${encodeURIComponent(post.category)}`}>{post.category}</Link> · {fmtDate(post.createdAt)} · 읽는 시간 {readMinutes(post.body)}분
            {post.status === 'draft' && <b className="chip">임시저장</b>}
            {post.visibility === 'private' && <b className="chip">비공개</b>}
          </p>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="art-summary">{post.excerpt}</p>}
          {isAdmin && (
            <p className="art-admin">
              <Link to={`/write/${post.id}`}>수정</Link>
              <button type="button" onClick={onDelete}>
                삭제
              </button>
            </p>
          )}

          <figure className="post-cover">
            <Tile post={post} no={no} ratio="16 / 9" size="xl" />
          </figure>

          <div className="art">
            <Body html={html} />
          </div>
        </div>
      </div>

      <section className="related" aria-labelledby="rel">
        <h2 id="rel">다음에 읽을 글</h2>
        <div className="grid three">
          {related.map((p) => (
            <Link key={p.id} to={`/post/${p.id}`} className="note">
              <Tile post={p} no={noOf(all, p)} />
              <p className="nd">{fmtDate(p.createdAt)}</p>
              <p className="nt">{p.title}</p>
            </Link>
          ))}
          <Link to="/notes" className="all-tile">
            전체 글 보기 →
          </Link>
        </div>
      </section>
    </article>
  )
}

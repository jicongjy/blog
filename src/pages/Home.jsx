import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPosts } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
import { fmtDate, pad, readMinutes } from '../lib/format.js'

export default function Home() {
  const { isAdmin } = useAuth()
  const [posts, setPosts] = useState(null)
  const [tag, setTag] = useState(null)

  useEffect(() => {
    listPosts({ includeDrafts: isAdmin }).then(setPosts)
  }, [isAdmin])

  const tags = useMemo(() => [...new Set((posts ?? []).flatMap((p) => p.tags))], [posts])
  const shown = (posts ?? []).filter((p) => !tag || p.tags.includes(tag))
  const [lead, ...rest] = shown
  const total = posts?.length ?? 0

  return (
    <>
      <section className="hero">
        <p className="eyebrow">01 / 글</p>
        <h1>
          일하며 만들고,
          <br />
          <em>배운 것을</em> 기록합니다.
        </h1>
        <p className="hero-note">
          기획에서 구현, 배포까지 직접 해 보며 남기는 메모. 지금까지 쓴 글 {pad(total)}편.
        </p>
      </section>

      {posts && tags.length > 0 && (
        <div className="filters" role="group" aria-label="태그">
          <button type="button" className={!tag ? 'on' : ''} onClick={() => setTag(null)}>
            전체
          </button>
          {tags.map((t) => (
            <button key={t} type="button" className={tag === t ? 'on' : ''} onClick={() => setTag(t)}>
              {t}
            </button>
          ))}
        </div>
      )}

      {posts && lead && (
        <Link to={`/post/${lead.id}`} className="lead">
          <span className="lead-no">No.{pad(total - posts.indexOf(lead))}</span>
          <div className="lead-body">
            <p className="meta">
              {lead.status === 'draft' && <b className="draft">임시저장</b>}
              {lead.tags.join(' · ')} — {fmtDate(lead.createdAt)}
            </p>
            <h2>{lead.title}</h2>
            <p className="deck">{lead.excerpt}</p>
            <span className="more">
              읽기 · {readMinutes(lead.body)}분 <i>→</i>
            </span>
          </div>
        </Link>
      )}

      {posts && rest.length > 0 && (
        <ol className="index" aria-label="글 목록">
          {rest.map((p) => (
            <li key={p.id}>
              <Link to={`/post/${p.id}`}>
                <span className="no">No.{pad(total - posts.indexOf(p))}</span>
                <span className="ttl">
                  {p.status === 'draft' && <b className="draft">임시저장</b>}
                  {p.title}
                </span>
                <span className="tg">{p.tags.join(' · ')}</span>
                <span className="dt">{fmtDate(p.createdAt)}</span>
                <i aria-hidden="true">↗</i>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {posts && shown.length === 0 && <p className="empty">아직 글이 없어요.</p>}
    </>
  )
}

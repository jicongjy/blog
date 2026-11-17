import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown.jsx'
import Thumb from '../components/Thumb.jsx'
import { getPost, listPosts, removePost } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
import { fmtDate, readMinutes } from '../lib/format.js'

const i0 = (list, post) => Math.max(0, list.findIndex((p) => p.id === post.id))

export default function Post() {
  const { id } = useParams()
  const nav = useNavigate()
  const { isAdmin } = useAuth()
  const [post, setPost] = useState(undefined)
  const [all, setAll] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
    getPost(id).then(setPost)
    listPosts({ includeDrafts: isAdmin }).then(setAll)
  }, [id, isAdmin])

  if (post === undefined) return null
  if (post === null || (post.status !== 'published' && !isAdmin))
    return (
      <section className="hero">
        <p className="eyebrow">404</p>
        <h1>글을 찾을 수 없습니다.</h1>
        <Link className="back" to="/">
          ← 글 목록
        </Link>
      </section>
    )

  const i = all.findIndex((p) => p.id === post.id)
  const newer = all[i - 1]
  const older = all[i + 1]

  const onDelete = async () => {
    if (!window.confirm('이 글을 삭제합니다. 되돌릴 수 없습니다.')) return
    await removePost(post.id)
    nav('/')
  }

  return (
    <article className="article">
      <header className="article-head">
        <p className="eyebrow">{post.tags.join(' · ')}</p>
        <h1>{post.title}</h1>
        <p className="deck">{post.excerpt}</p>
      </header>

      <figure className="article-cover">
        <Thumb post={post} no={String(all.length - i0(all, post)).padStart(2, '0')} ratio="21 / 9" />
      </figure>

      <div className="article-grid">
        <aside className="margin">
          <dl>
            <dt>작성</dt>
            <dd>{fmtDate(post.createdAt)}</dd>
            <dt>읽는 시간</dt>
            <dd>{readMinutes(post.body)}분</dd>
            {post.status === 'draft' && (
              <>
                <dt>상태</dt>
                <dd>임시저장</dd>
              </>
            )}
          </dl>
          <Link className="back" to="/">
            ← 글 목록
          </Link>
          {isAdmin && (
            <div className="admin-actions">
              <Link to={`/write/${post.id}`}>수정</Link>
              <button type="button" onClick={onDelete}>
                삭제
              </button>
            </div>
          )}
        </aside>
        <div className="article-body">
          <Markdown source={post.body} />
        </div>
      </div>

      <nav className="pager" aria-label="이전·다음 글">
        {older ? (
          <Link to={`/post/${older.id}`}>
            <small>이전 글</small>
            <span>{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link to={`/post/${newer.id}`} className="next">
            <small>다음 글</small>
            <span>{newer.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}

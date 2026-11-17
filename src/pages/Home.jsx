import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Thumb from '../components/Thumb.jsx'
import { listPosts } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
import { fmtDate, pad } from '../lib/format.js'

export default function Home() {
  const { isAdmin } = useAuth()
  const [posts, setPosts] = useState(null)
  const [tag, setTag] = useState(null)

  useEffect(() => {
    listPosts({ includeDrafts: isAdmin }).then(setPosts)
  }, [isAdmin])

  const tags = useMemo(() => [...new Set((posts ?? []).flatMap((p) => p.tags))], [posts])
  const total = posts?.length ?? 0
  const shown = (posts ?? []).filter((p) => !tag || p.tags.includes(tag))
  const noOf = (p) => pad(total - posts.indexOf(p))
  const latest = posts?.[0]

  return (
    <div className="spread">
      <section className="page cover" aria-label="소개">
        <h1 className="display">
          Planning
          <br />
          Notes.
        </h1>
        <p className="ko-title">기획 노트</p>
        <p className="meta-lines">
          서비스 기획에 관한 글
          <br />
          {latest ? `최근 업데이트 ${fmtDate(latest.createdAt)}` : '아직 글이 없습니다'}
        </p>

        <table className="toc" aria-label="분류">
          <thead>
            <tr>
              <th>분류</th>
              <th className="r">글 수</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <button type="button" className={!tag ? 'on' : ''} onClick={() => setTag(null)}>
                  전체
                </button>
              </td>
              <td className="r">{pad(total)}</td>
            </tr>
            {tags.map((t) => (
              <tr key={t}>
                <td>
                  <button type="button" className={tag === t ? 'on' : ''} onClick={() => setTag(t)}>
                    {t}
                  </button>
                </td>
                <td className="r">{pad(posts.filter((p) => p.tags.includes(t)).length)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="page list-page" aria-label="글 목록">
        {posts && shown.length === 0 && <p className="empty">등록된 글이 없습니다.</p>}
        <ol className="entries">
          {shown.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'first' : ''}>
              <Link to={`/post/${p.id}`}>
                <Thumb post={p} no={noOf(p)} ratio={i === 0 ? '16 / 9' : '4 / 3'} />
                <div className="entry-text">
                  <p className="entry-meta">
                    <span>No.{noOf(p)}</span>
                    <span>{p.tags.join(' · ')}</span>
                    <span>{fmtDate(p.createdAt)}</span>
                  </p>
                  <h2>
                    {p.status === 'draft' && <b className="draft">임시저장</b>}
                    {p.title}
                  </h2>
                  <p className="entry-excerpt">{p.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

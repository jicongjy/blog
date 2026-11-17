import { Link, useOutletContext } from 'react-router-dom'
import Tile from '../components/Tile.jsx'
import { fmtDate, noOf } from '../lib/format.js'

function Arrow({ dark }) {
  return (
    <span className={`arrow ${dark ? 'dark' : ''}`} aria-hidden="true">
      ↗
    </span>
  )
}

export default function Home() {
  const { posts } = useOutletContext()
  const picks = (posts ?? []).slice(0, 3)

  return (
    <>
      <section className="intro" aria-label="소개">
        <h1>
          Plan. Define. <span>Review.</span>
        </h1>
        <p>서비스 기획에 관한 글을 정리합니다.</p>
      </section>

      {posts && picks.length > 0 && (
        <section aria-labelledby="pick">
          <h2 id="pick" className="sec-h">
            추천 글
          </h2>
          <div className="bento">
            {picks.map((p, i) => (
              <Link key={p.id} to={`/post/${p.id}`} className={`pick ${i === 0 ? 'big' : ''}`}>
                <span className="pick-top">
                  <span>{p.category}</span>
                  <span>{fmtDate(p.createdAt)}</span>
                </span>
                <span className="pick-bottom">
                  <span className="pick-title">{p.title}</span>
                  <Arrow dark={i !== 0} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="all">
        <div className="sec-row">
          <h2 id="all" className="sec-h">
            All Notes
          </h2>
          <Link to="/notes" className="more">
            전체 글 보기 →
          </Link>
        </div>
        {posts && posts.length === 0 && <p className="empty">등록된 글이 없습니다.</p>}
        <div className="grid">
          {(posts ?? []).slice(0, 9).map((p) => (
            <Link key={p.id} to={`/post/${p.id}`} className="note">
              <Tile post={p} no={noOf(posts, p)} />
              <p className="nd">
                {p.status === 'draft' && <b className="chip">임시저장</b>}
                {p.visibility === 'private' && <b className="chip">비공개</b>}
                {fmtDate(p.createdAt)}
              </p>
              <p className="nt">{p.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

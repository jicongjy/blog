import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { heroImage, postFallback } from '../data/categoryImages.js'
import { categoryClick, selectArticle } from '../lib/analytics.js'
import HmTop from '../components/HmTop.jsx'
import Loading from '../components/Loading.jsx'
import { fmtDate } from '../lib/format.js'
import { useCategories } from '../lib/useCategories.js'
import { usePosts } from '../lib/usePosts.js'

export default function Home() {
  const posts = usePosts()
  const [cats] = useCategories()
  const [filter, setFilter] = useState(null) // 적용 중인 카테고리 이름

  // 선택한 색 조합이 화면 바탕과 글자에 적용되도록 body에 표시를 붙인다.
  useEffect(() => {
    document.body.classList.add('is-home')
    return () => document.body.classList.remove('is-home')
  }, [])

  const list = posts ?? []
  const names = useMemo(() => {
    const inPosts = list.map((p) => p.category).filter(Boolean)
    const fromDb = (cats ?? []).map((c) => c.name).filter((name) => inPosts.includes(name))
    return [...new Set([...fromDb, ...inPosts])]
  }, [cats, list])
  const count = (n) => list.filter((p) => p.category === n).length
  const shown = filter ? list.filter((p) => p.category === filter) : list

  const pick = (name) => {
    categoryClick(name, 'home_filter')
    setFilter(name)
  }

  return (
    <div className="hm">
      <HmTop />

      {/* 소개: 어떤 블로그인지 먼저 알려 주고, 글 카드는 바로 아래에 이어진다 */}
      <section className="hm-intro" aria-label="소개">
        <p className="hm-label">About</p>
        <h1 className="hm-intro-text">
          <b>서비스 기획에 대한 글을 쓰는 블로그입니다.</b> 문제를 어떻게 정의하고, 화면과 운영으로 어떻게 풀어 가는지 다룹니다.
        </h1>
        <ul className="hm-filter" aria-label="카테고리">
          <li>
            <button type="button" className={!filter ? 'on' : ''} onClick={() => setFilter(null)}>
              전체<sup>{list.length}</sup>
            </button>
          </li>
          {names.map((n) => (
            <li key={n}>
              <button type="button" className={filter === n ? 'on' : ''} onClick={() => pick(n)}>
                {n}
                <sup>{count(n)}</sup>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="hm-notes" id="notes" aria-label="글">
        {!posts && <Loading />}
        {posts && shown.length === 0 && <p className="hm-empty">아직 글이 없습니다.</p>}

        <ul className="hm-grid">
          {shown.map((p) => {
            const src = p.thumbnail || postFallback(p.category, names.indexOf(p.category)) || heroImage
            return (
              <li key={p.id}>
                <article className="hm-card" data-post-id={p.id}>
                  <Link to={`/post/${p.id}`} className="hm-slot" aria-label={p.title} onClick={() => selectArticle(p, 'home_card')}>
                    <img src={src} alt="" loading="lazy" />
                  </Link>
                  <p className="hm-card-meta">
                    <span className="hm-category"><span aria-hidden="true" />{p.category}</span>
                    <span className="g">{fmtDate(p.createdAt)}</span>
                  </p>
                  <h2 className="hm-title"><Link to={`/post/${p.id}`} onClick={() => selectArticle(p, 'home_card')}>{p.title}</Link></h2>
                  {p.excerpt && <p className="hm-subtitle">{p.excerpt}</p>}
                </article>
              </li>
            )
          })}
        </ul>
      </section>

      <footer className="hm-foot">© {new Date().getFullYear()} 기획 노트</footer>
    </div>
  )
}

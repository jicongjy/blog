import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryImage, heroImage, postFallback } from '../data/categoryImages.js'
import { categoryClick, selectArticle } from '../lib/analytics.js'
import { startSectionScroll } from '../lib/sectionScroll.js'
import HmTop from '../components/HmTop.jsx'
import { fmtDate, readMinutes } from '../lib/format.js'
import { useCategories } from '../lib/useCategories.js'
import { usePosts } from '../lib/usePosts.js'

export default function Home() {
  const posts = usePosts()
  const [cats] = useCategories()
  const [active, setActive] = useState(0) // 첫 화면에서 강조 중인 카테고리 순서
  const [filter, setFilter] = useState(null) // 글 섹션에 적용 중인 카테고리 이름
  const [activePost, setActivePost] = useState(null)
  const notes = useRef(null)

  // 홈은 흰 화면으로 쓴다.
  useEffect(() => {
    document.body.classList.add('is-home')
    document.documentElement.classList.add('snap-home')
    const stop = startSectionScroll()
    return () => {
      stop()
      document.body.classList.remove('is-home')
      document.documentElement.classList.remove('snap-home')
    }
  }, [])

  const list = posts ?? []
  const names = useMemo(() => {
    const inPosts = list.map((p) => p.category).filter(Boolean)
    const fromDb = (cats ?? []).map((c) => c.name).filter((name) => inPosts.includes(name))
    return [...new Set([...fromDb, ...inPosts])]
  }, [cats, list])
  const count = (n) => list.filter((p) => p.category === n).length
  const shown = filter ? list.filter((p) => p.category === filter) : list

  // 글이 화면에 들어오면 이미지와 설명을 나타내고, 왼쪽 목차의 현재 글도 바꾼다.
  useEffect(() => {
    const els = document.querySelectorAll('.hm-entry')
    const io = new IntersectionObserver(
      (items) => items.forEach((it) => {
        if (!it.isIntersecting) return
        it.target.classList.add('in')
        setActivePost(it.target.dataset.postId)
      }),
      { threshold: 0.05, rootMargin: '-20% 0px -55% 0px' }
    )
    els.forEach((el) => io.observe(el))
    setActivePost(els[0]?.dataset.postId ?? null)
    return () => io.disconnect()
  }, [shown.length, filter, posts])

  const pick = (name) => {
    categoryClick(name, 'home_hero')
    setFilter(name)
    notes.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="hm">
      {/* 첫 화면 */}
      <section className="hm-hero" aria-label="소개">
        <HmTop />

        <h1 className="hm-statement">
          <b>문제 정의</b>, <b>화면 설계</b>, <b>운영</b>에서 배운 것을 기록합니다.
        </h1>

        <div className="hm-cats">
          <p className="hm-label">Categories</p>
          <ul className="hm-catlist">
            {names.map((n, i) => (
              <li key={n}>
                <button type="button" className={i === active ? 'on' : ''} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => { setActive(i); pick(n) }}>
                  {n}
                  <sup>{count(n)}</sup>
                </button>
              </li>
            ))}
          </ul>
          <div className="hm-catimg" aria-hidden="true">
            {names.map((n, i) => {
              const src = categoryImage(n, i)
              return src ? <img key={n} src={src} alt="" className={i === active ? 'on' : ''} /> : null
            })}
          </div>
        </div>
      </section>

      {/* 글 섹션 */}
      <section className="hm-notes" id="notes" ref={notes} aria-label="글">
        <aside className="hm-side">
          <p className="hm-label">Notes</p>
          <ol>
            {shown.map((p) => (
              <li key={p.id} className={activePost === p.id ? 'on' : ''}>
                <Link to={`/post/${p.id}`} onClick={() => selectArticle(p, 'home_toc')}>{p.title}</Link>
              </li>
            ))}
          </ol>
        </aside>

        <div className="hm-feed">
          <div className="hm-feedhead">
            <p>{filter ? filter : '최근 글'}</p>
            {filter && (
              <button type="button" onClick={() => setFilter(null)}>
                전체 보기
              </button>
            )}
          </div>

          {posts && shown.length === 0 && <p className="hm-empty">아직 글이 없습니다.</p>}

          {shown.slice(0, 6).map((p) => {
            const ci = names.indexOf(p.category)
            const src = p.thumbnail || postFallback(p.category, ci) || heroImage
            return (
              <article key={p.id} className="hm-entry" data-post-id={p.id}>
                <Link to={`/post/${p.id}`} className="hm-slot" aria-label={p.title} onClick={() => selectArticle(p, 'home_card')}>
                  <img src={src} alt="" loading="lazy" />
                </Link>
                <div className="hm-row">
                  <div className="hm-copy">
                    <h2 className="hm-title"><Link to={`/post/${p.id}`} onClick={() => selectArticle(p, 'home_card')}>{p.title}</Link></h2>
                    {p.excerpt && <p className="hm-subtitle">{p.excerpt}</p>}
                  </div>
                  <div className="hm-meta">
                    <p className="hm-category"><span aria-hidden="true" />{p.category}</p>
                    <p className="g hm-date">
                      <span>{fmtDate(p.createdAt)}</span>
                      <span className="hm-readtime">읽는 시간 {readMinutes(p.body)}분</span>
                    </p>
                  </div>
                </div>
                <Link to={`/post/${p.id}`} className="hm-read" onClick={() => selectArticle(p, 'home_card')}>
                  읽기
                </Link>
              </article>
            )
          })}

          {shown.length > 6 && (
            <p className="hm-more">
              <Link to={filter ? `/notes?c=${encodeURIComponent(filter)}` : '/notes'}>전체 글 보기 →</Link>
            </p>
          )}
        </div>
      </section>

      <footer className="hm-foot">© {new Date().getFullYear()} 기획 노트</footer>
    </div>
  )
}

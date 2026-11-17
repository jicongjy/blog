import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import HmTop from '../components/HmTop.jsx'
import { heroImage, postFallback } from '../data/categoryImages.js'
import { fmtDate, noOf } from '../lib/format.js'
import { useCategories } from '../lib/useCategories.js'
import { usePosts } from '../lib/usePosts.js'

export default function List() {
  const posts = usePosts()
  const [cats] = useCategories()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [hover, setHover] = useState(0)
  const category = params.get('c')

  useEffect(() => {
    document.body.classList.add('is-home')
    return () => document.body.classList.remove('is-home')
  }, [])

  const list = posts ?? []
  const names = useMemo(() => [...new Set([...(cats ?? []).map((c) => c.name), ...list.map((p) => p.category).filter(Boolean)])], [cats, list])
  const shown = list.filter((p) => (!category || p.category === category) && p.title.toLowerCase().includes(q.trim().toLowerCase()))
  const imgOf = (p) => p.thumbnail || postFallback(p.category, names.indexOf(p.category)) || heroImage
  const cur = shown[Math.min(hover, shown.length - 1)]
  const pick = (c) => {
    setHover(0)
    setParams(c ? { c } : {})
  }

  return (
    <div className="hm ls">
      <HmTop />

      <div className="ls-cols">
        <aside className="ls-filter" aria-label="필터">
          <p className="hm-label">Categories</p>
          <ul>
            <li>
              <button type="button" className={!category ? 'on' : ''} onClick={() => pick(null)}>
                All<sup>{list.length}</sup>
              </button>
            </li>
            {names.map((n) => (
              <li key={n}>
                <button type="button" className={category === n ? 'on' : ''} onClick={() => pick(n)}>
                  {n}
                  <sup>{list.filter((p) => p.category === n).length}</sup>
                </button>
              </li>
            ))}
          </ul>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="ls-search">
            <label htmlFor="q" className="sr">
              글 검색
            </label>
            <input id="q" type="search" placeholder="글 검색" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
        </aside>

        <section className="ls-list" aria-label="글 목록">
          <p className="hm-label">
            {category ?? 'All'} · {shown.length}
          </p>
          {posts && shown.length === 0 && <p className="ls-empty">조건에 맞는 글이 없습니다.</p>}
          <ol>
            {shown.map((p, i) => (
              <li key={p.id} onMouseEnter={() => setHover(i)}>
                <Link to={`/post/${p.id}`} onFocus={() => setHover(i)}>
                  <span className="n">{Number(noOf(list, p))}.</span>
                  <span className="t">{p.title}</span>
                  <span className="c">{p.category}</span>
                  <span className="d">{fmtDate(p.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <aside className="ls-prev" aria-hidden="true">
          {cur && (
            <div className="stick">
              <img src={imgOf(cur)} alt="" />
            </div>
          )}
        </aside>
      </div>

      <footer className="hm-foot">© {new Date().getFullYear()} 기획 노트</footer>
    </div>
  )
}

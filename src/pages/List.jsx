import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import HmTop from '../components/HmTop.jsx'
import Loading from '../components/Loading.jsx'
import { heroImage, postFallback } from '../data/categoryImages.js'
import { categoryClick, selectArticle, track } from '../lib/analytics.js'
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
  const names = useMemo(() => {
    const inPosts = list.map((p) => p.category).filter(Boolean)
    const fromDb = (cats ?? []).map((c) => c.name).filter((name) => inPosts.includes(name))
    return [...new Set([...fromDb, ...inPosts])]
  }, [cats, list])
  const shown = list.filter((p) => (!category || p.category === category) && p.title.toLowerCase().includes(q.trim().toLowerCase()))
  const imgOf = (p) => p.thumbnail || postFallback(p.category, names.indexOf(p.category)) || heroImage
  // 검색: 입력이 0.8초 멈추면 한 번 보낸다. 한 글자 이하와 같은 검색어 반복은 보내지 않는다.
  const resultCount = useRef(0)
  resultCount.current = shown.length
  const lastTerm = useRef('')
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) lastTerm.current = ''
    if (term.length < 2 || term === lastTerm.current) return undefined
    const t = window.setTimeout(() => {
      lastTerm.current = term
      // 이메일, 전화번호, 긴 숫자처럼 개인정보로 보이는 검색어는 보내지 않고, 길이는 50자로 자른다.
      const personal = /@|\d{6,}|https?:/i.test(term)
      track('search', { search_term: personal ? '(제외됨)' : term.slice(0, 50), result_count: resultCount.current })
    }, 800)
    return () => window.clearTimeout(t)
  }, [q])
  const cur = shown[Math.min(hover, shown.length - 1)]
  const pick = (c) => {
    categoryClick(c, 'list_filter')
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
          {!posts && <Loading />}
          {posts && shown.length === 0 && <p className="ls-empty">조건에 맞는 글이 없습니다.</p>}
          <ol>
            {shown.map((p, i) => (
              <li key={p.id} onMouseEnter={() => setHover(i)}>
                <Link to={`/post/${p.id}`} onFocus={() => setHover(i)} onClick={() => selectArticle(p, 'list_index')}>
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

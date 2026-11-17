import { useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import Tile from '../components/Tile.jsx'
import { fmtDate, noOf } from '../lib/format.js'
import { useCategories } from '../lib/useCategories.js'

export default function List() {
  const { posts } = useOutletContext()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const category = params.get('c')
  const list = posts ?? []
  const [dbCats] = useCategories()
  const cats = [...new Set([...(dbCats ?? []).map((c) => c.name), ...list.map((p) => p.category).filter(Boolean)])]
  const shown = list.filter((p) => (!category || p.category === category) && p.title.toLowerCase().includes(q.trim().toLowerCase()))
  const pick = (c) => setParams(c ? { c } : {})

  return (
    <>
      <section className="list-head" aria-label="목록 제목">
        <div>
          <p className="count">{category ? `${category} ` : '전체 '}글 {shown.length}편</p>
          <h1 className="h1">
            All <span>Notes.</span>
          </h1>
        </div>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="search">
          <label htmlFor="q" className="sr">
            글 검색
          </label>
          <input id="q" type="search" placeholder="제목으로 검색" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      </section>

      <div className="chips" role="group" aria-label="카테고리 필터">
        <button type="button" className={!category ? 'on' : ''} onClick={() => pick(null)}>
          전체
        </button>
        {cats.map((c) => (
          <button key={c} type="button" className={category === c ? 'on' : ''} onClick={() => pick(c)}>
            {c}
          </button>
        ))}
      </div>

      {posts && shown.length === 0 && <p className="empty">조건에 맞는 글이 없습니다.</p>}
      <div className="grid">
        {shown.map((p) => (
          <Link key={p.id} to={`/post/${p.id}`} className="note">
            <Tile post={p} no={noOf(list, p)} />
            <p className="nd">
              {p.status === 'draft' && <b className="chip">임시저장</b>}
              {p.visibility === 'private' && <b className="chip">비공개</b>}
              {fmtDate(p.createdAt)}
            </p>
            <p className="nt">{p.title}</p>
            <p className="nx">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </>
  )
}

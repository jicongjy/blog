import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addCategory, moveCategory, removeCategory, renameCategory } from '../data/categories.js'
import { listPosts } from '../data/posts.js'
import { useAuth } from '../lib/auth.jsx'
import { useCategories } from '../lib/useCategories.js'

export default function Categories() {
  const { isAdmin, ready } = useAuth()
  const [cats, reload] = useCategories()
  const [counts, setCounts] = useState({})
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null) // { id, name }
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (isAdmin) listPosts({ isAdmin: true }).then((ps) => setCounts(ps.reduce((m, p) => ({ ...m, [p.category]: (m[p.category] ?? 0) + 1 }), {})))
  }, [isAdmin, cats])

  if (!ready) return null
  if (!isAdmin)
    return (
      <div className="post-missing">
        <h1 className="h1">
          로그인이 <span>필요합니다.</span>
        </h1>
        <Link className="btn" to="/login">
          관리자 로그인
        </Link>
      </div>
    )

  const run = async (fn) => {
    setMsg('')
    try {
      await fn()
      await reload()
    } catch (e) {
      setMsg(e.message || '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <section className="editor">
      <div className="editor-top">
        <h1 className="h1 sm">
          카테고리 <span>관리</span>
        </h1>
        <div className="editor-actions">
          <Link to="/write">글쓰기</Link>
        </div>
      </div>

      <div className="cat-admin">
        <form
          className="cat-add"
          onSubmit={(e) => {
            e.preventDefault()
            run(async () => {
              await addCategory(name)
              setName('')
            })
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="새 카테고리 이름" maxLength={30} aria-label="새 카테고리 이름" />
          <button type="submit" className="btn">
            추가
          </button>
        </form>
        {msg && <p className="form-error">{msg}</p>}

        <ul className="cat-list">
          {(cats ?? []).map((c, i) => (
            <li key={c.id}>
              {editing?.id === c.id ? (
                <input
                  autoFocus
                  value={editing.name}
                  maxLength={30}
                  aria-label="카테고리 이름"
                  onChange={(e) => setEditing({ id: c.id, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') run(async () => { await renameCategory(c, editing.name); setEditing(null) })
                    if (e.key === 'Escape') setEditing(null)
                  }}
                />
              ) : (
                <span className="nm">
                  {c.name}
                  <sup>{counts[c.name] ?? 0}</sup>
                </span>
              )}
              <span className="ops">
                {editing?.id === c.id ? (
                  <>
                    <button type="button" onClick={() => run(async () => { await renameCategory(c, editing.name); setEditing(null) })}>저장</button>
                    <button type="button" onClick={() => setEditing(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <button type="button" disabled={i === 0} onClick={() => run(() => moveCategory(c, -1))} aria-label="위로">↑</button>
                    <button type="button" disabled={i === cats.length - 1} onClick={() => run(() => moveCategory(c, 1))} aria-label="아래로">↓</button>
                    <button type="button" onClick={() => setEditing({ id: c.id, name: c.name })}>이름 변경</button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`'${c.name}' 카테고리를 삭제할까요?`)) run(() => removeCategory(c))
                      }}
                    >
                      삭제
                    </button>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="cat-note">이름을 바꾸면 그 카테고리의 글도 함께 바뀝니다. 글이 있는 카테고리는 삭제할 수 없습니다.</p>
      </div>
    </section>
  )
}

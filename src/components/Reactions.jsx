import { useEffect, useState } from 'react'
import { loadReactions, saveMine } from '../data/reactions.js'
import { postParams, track } from '../lib/analytics.js'
import Avatar from './Avatar.jsx'

// 글 아래의 좋아요, 스크랩 버튼. 같은 사람이 여러 번 눌러도 1회로 집계되고, 다시 누르면 취소된다.
export default function Reactions({ post }) {
  const [state, setState] = useState(undefined) // undefined: 불러오는 중, null: 사용 불가
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    setState(undefined)
    loadReactions(post.id).then((r) => alive && setState(r))
    return () => {
      alive = false
    }
  }, [post.id])

  if (!state) return null

  const toggle = async (kind) => {
    if (busy) return
    setBusy(true)
    const on = !state.mine[kind]
    const mine = { ...state.mine, [kind]: on }
    const me = await saveMine(post.id, mine)
    if (me) {
      const likers = kind === 'like' ? (on ? [me, ...state.likers.filter((u) => u !== me)] : state.likers.filter((u) => u !== me)) : state.likers
      setState({ ...state, counts: { ...state.counts, [kind]: state.counts[kind] + (on ? 1 : -1) }, mine, likers })
      track(on ? kind : `un${kind}`, postParams(post))
    }
    setBusy(false)
  }

  return (
    <>
      <div className="pd-react" role="group" aria-label="반응">
        {[
          ['like', '좋아요'],
          ['scrap', '스크랩'],
        ].map(([kind, label]) => (
          <button key={kind} type="button" className={state.mine[kind] ? 'on' : ''} aria-pressed={state.mine[kind]} onClick={() => toggle(kind)} disabled={busy}>
            {label} <span>{state.counts[kind]}</span>
          </button>
        ))}
      </div>
      {state.likers.length > 0 && (
        <div className="pd-likers" aria-label={`좋아요 ${state.likers.length}명`}>
          <span className="pd-likers-stack">
            {state.likers.slice(0, 5).map((u) => (
              <Avatar key={u} seed={u} size={30} />
            ))}
          </span>
          <span className="pd-likers-text">
            {state.likers.length > 5 ? `외 ${state.likers.length - 5}명이 ` : ''}이 글을 좋아합니다
          </span>
        </div>
      )}
    </>
  )
}

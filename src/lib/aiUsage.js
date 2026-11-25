// 사용 기록(F7): 글에 남기는 AI 제안 사용 기록. 계정 정보와 본문은 넣지 않는다.
// 한 번도 쓰지 않은 글은 null이고, 글을 다시 열면 저장된 기록을 이어받는다.
const FIELDS = ['title', 'excerpt', 'category']

// 호출이 끝날 때마다 호출 횟수와 마지막 결과를 갱신한다. 실패하면 이전 제안값은 그대로 둔다.
export function recordCall(prev, { ok, ms, suggestion }) {
  const next = { ...(prev ?? {}), calls: (prev?.calls ?? 0) + 1, lastOk: ok, lastMs: ms ?? null }
  if (ok && suggestion) for (const k of FIELDS) next[k] = { suggested: suggestion[k] ?? '', final: prev?.[k]?.final ?? '' }
  return next
}

// 저장할 때 항목마다 최종값을 채운다. 쓴 적이 없으면 null.
export function withFinal(usage, final) {
  if (!usage) return null
  const out = { ...usage }
  for (const k of FIELDS) out[k] = { suggested: usage[k]?.suggested ?? '', final: String(final[k] ?? '').trim() }
  return out
}

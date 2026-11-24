import { describe, expect, it } from 'vitest'
import { recordCall, withFinal } from './aiUsage.js'

const s = { title: '제안 제목', excerpt: '제안 요약', category: '기획' }

describe('recordCall', () => {
  it('처음 성공하면 횟수 1과 제안값을 남긴다', () => {
    const u = recordCall(null, { ok: true, ms: 3000, suggestion: s })
    expect(u).toMatchObject({ calls: 1, lastOk: true, lastMs: 3000 })
    expect(u.title.suggested).toBe('제안 제목')
  })
  it('실패하면 횟수만 늘고 이전 제안값은 남는다', () => {
    const a = recordCall(null, { ok: true, ms: 3000, suggestion: s })
    const b = recordCall(a, { ok: false, ms: null })
    expect(b).toMatchObject({ calls: 2, lastOk: false, lastMs: null })
    expect(b.excerpt.suggested).toBe('제안 요약')
  })
  it('저장된 기록을 이어받아 횟수를 쌓는다', () => {
    const saved = { calls: 3, lastOk: true, lastMs: 2000, title: { suggested: 'a', final: 'b' }, excerpt: { suggested: '', final: '' }, category: { suggested: '', final: '' } }
    expect(recordCall(saved, { ok: true, ms: 100, suggestion: s }).calls).toBe(4)
  })
})

describe('withFinal', () => {
  it('쓴 적이 없으면 null', () => expect(withFinal(null, { title: 'x' })).toBeNull())
  it('항목마다 최종값을 채우고 고쳐 쓴 값은 제안값과 다르게 남는다', () => {
    const u = recordCall(null, { ok: true, ms: 1, suggestion: s })
    const r = withFinal(u, { title: ' 제안 제목 ', excerpt: '내가 고친 요약', category: '기획' })
    expect(r.title).toEqual({ suggested: '제안 제목', final: '제안 제목' })
    expect(r.excerpt).toEqual({ suggested: '제안 요약', final: '내가 고친 요약' })
    expect(r.calls).toBe(1)
  })
  it('제안을 받지 못한 글은 제안값이 빈 문자열', () => {
    const u = recordCall(null, { ok: false, ms: null })
    expect(withFinal(u, { title: '직접', excerpt: '직접', category: '기획' }).title).toEqual({ suggested: '', final: '직접' })
  })
})

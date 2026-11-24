import { afterEach, describe, expect, it, vi } from 'vitest'

const model = { generateContent: vi.fn() }
let enabled = true
vi.mock('./ai.js', () => ({
  AI_TIMEOUT_MS: 10_000,
  getSuggestModel: () => (enabled ? model : null),
}))

const { buildPrompt, htmlToText, normalizeSuggestion, requestSuggestion, MAX_CALLS } = await import('./suggest.js')
const categories = ['기획', '회고']
const reply = (obj) => ({ response: { text: () => (typeof obj === 'string' ? obj : JSON.stringify(obj)) } })

afterEach(() => {
  vi.useRealTimers()
  model.generateContent.mockReset()
  enabled = true
})

describe('htmlToText', () => {
  it('태그를 빼고 공백을 정리한다', () => {
    expect(htmlToText('<p>안녕</p><p> 하세요 </p>')).toBe('안녕 하세요')
  })
  it('비어 있으면 빈 문자열이다', () => {
    expect(htmlToText('')).toBe('')
    expect(htmlToText(undefined)).toBe('')
  })
})

describe('buildPrompt', () => {
  it('제목, 본문, 카테고리 이름과 규칙을 담고 다른 정보는 담지 않는다', () => {
    const p = buildPrompt({ title: '내 글', text: '본문입니다', categories })
    expect(p).toContain('현재 제목: 내 글')
    expect(p).toContain('본문입니다')
    expect(p).toContain('기획, 회고')
    expect(p).toContain('본문에 없는 내용은 쓰지 않는다')
    expect(p).toContain('120자')
  })
  it('제목이 비어 있으면 없음으로 적는다', () => {
    expect(buildPrompt({ title: '', text: 'a', categories })).toContain('현재 제목: (없음)')
  })
})

describe('normalizeSuggestion', () => {
  it('앞뒤 공백을 지운다', () => {
    expect(normalizeSuggestion({ title: ' 제목 ', excerpt: ' 요약 ', category: '기획' }, categories)).toEqual({ title: '제목', excerpt: '요약', category: '기획' })
  })
  it('목록에 없는 카테고리는 비운다', () => {
    expect(normalizeSuggestion({ title: 't', excerpt: 'e', category: '없는 카테고리' }, categories).category).toBe('')
  })
  it('문자열이 아닌 값이나 빈 응답은 빈 문자열로 바꾼다', () => {
    expect(normalizeSuggestion({ title: 1, excerpt: null }, categories)).toEqual({ title: '', excerpt: '', category: '' })
    expect(normalizeSuggestion(undefined, categories)).toEqual({ title: '', excerpt: '', category: '' })
  })
})

describe('requestSuggestion (F1, F6)', () => {
  const args = { title: '', body: '<p>본문</p>', categories }

  it('성공하면 다듬은 제안과 응답 시간을 돌려준다', async () => {
    model.generateContent.mockResolvedValue(reply({ title: '제목', excerpt: '요약', category: '회고' }))
    const r = await requestSuggestion(args)
    expect(r).toMatchObject({ title: '제목', excerpt: '요약', category: '회고' })
    expect(typeof r.ms).toBe('number')
  })
  it('AI를 쓸 수 없으면(관리자가 아니거나 연결이 없으면) 실패한다', async () => {
    enabled = false
    await expect(requestSuggestion(args)).rejects.toThrow('unavailable')
    expect(model.generateContent).not.toHaveBeenCalled()
  })
  it('호출이 실패하면 예외를 던진다', async () => {
    model.generateContent.mockRejectedValue(new Error('network'))
    await expect(requestSuggestion(args)).rejects.toThrow('network')
  })
  it('응답이 JSON이 아니면 실패한다', async () => {
    model.generateContent.mockResolvedValue(reply('죄송합니다'))
    await expect(requestSuggestion(args)).rejects.toThrow()
  })
  it('10초 안에 끝나지 않으면 실패한다', async () => {
    vi.useFakeTimers()
    model.generateContent.mockReturnValue(new Promise(() => {}))
    const p = requestSuggestion(args)
    const assertion = expect(p).rejects.toThrow('timeout')
    await vi.advanceTimersByTimeAsync(10_000)
    await assertion
  })
})

describe('MAX_CALLS', () => {
  it('글 한 편에서 제안을 5회까지 부른다(PRD 6.4)', () => {
    expect(MAX_CALLS).toBe(5)
  })
})

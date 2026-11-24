import { afterEach, describe, expect, it, vi } from 'vitest'

const state = { exists: true, data: { apiKey: ' TEST-KEY ' }, admin: true }
const getDoc = vi.fn(async () => ({ exists: () => state.exists, data: () => state.data }))
let authCb = null
vi.mock('firebase/auth', () => ({ onAuthStateChanged: (_a, cb) => { authCb = cb } }))
vi.mock('firebase/firestore', () => ({ doc: (...a) => a.join('/'), getDoc: (...a) => getDoc(...a) }))
vi.mock('./firebase.js', () => ({
  db: {},
  ADMIN_EMAIL: 'me@example.com',
  get auth() {
    return { currentUser: state.admin ? { emailVerified: true, email: 'Me@Example.com' } : { emailVerified: true, email: 'x@y.com' } }
  },
}))

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)
const ok = (obj) => ({ ok: true, json: async () => ({ content: [{ type: 'tool_use', name: 'suggest', input: obj }] }) })

async function fresh() {
  vi.resetModules()
  return import('./ai.js')
}
afterEach(() => {
  fetchMock.mockReset()
  getDoc.mockClear()
  Object.assign(state, { exists: true, data: { apiKey: ' TEST-KEY ' }, admin: true })
})

describe('getSuggestModel', () => {
  it('관리자가 아니면 모델을 주지 않는다', async () => {
    state.admin = false
    expect((await fresh()).getSuggestModel()).toBeNull()
  })
  it('키를 헤더로 보내고 응답 글자를 돌려준다', async () => {
    fetchMock.mockResolvedValue(ok({ title: 't' }))
    const schema = { type: 'object', properties: { title: { type: 'string' } } }
    const m = (await fresh()).getSuggestModel({ responseSchema: schema })
    const r = await m.generateContent('질문')
    expect(JSON.parse(r.response.text())).toEqual({ title: 't' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers['x-api-key']).toBe('TEST-KEY')
    expect(init.headers['anthropic-dangerous-direct-browser-access']).toBe('true')
    expect(url).not.toContain('TEST-KEY')
    const body = JSON.parse(init.body)
    expect(body.model).toBe('claude-haiku-5-5')
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'suggest' })
    expect(body.tools[0].input_schema).toEqual(schema)
  })
  it('키는 한 번만 읽는다', async () => {
    fetchMock.mockResolvedValue(ok({}))
    const m = (await fresh()).getSuggestModel()
    await m.generateContent('a')
    await m.generateContent('b')
    expect(getDoc).toHaveBeenCalledTimes(1)
  })
  it('키 문서가 없으면 사용 불가로 실패한다', async () => {
    state.exists = false
    const m = (await fresh()).getSuggestModel()
    await expect(m.generateContent('a')).rejects.toThrow('unavailable')
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('서버 오류는 상태 코드와 함께 실패한다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429 })
    const m = (await fresh()).getSuggestModel()
    await expect(m.generateContent('a')).rejects.toThrow('http 429')
  })
  it('키를 읽지 못하면 다음 호출에서 다시 읽는다', async () => {
    state.exists = false
    const m = (await fresh()).getSuggestModel()
    await expect(m.generateContent('a')).rejects.toThrow()
    state.exists = true
    fetchMock.mockResolvedValue(ok({ title: 'y' }))
    expect(JSON.parse((await m.generateContent('b')).response.text())).toEqual({ title: 'y' })
  })
  it('로그아웃하면 메모리의 키를 버리고 다시 읽는다', async () => {
    fetchMock.mockResolvedValue(ok({}))
    const m = (await fresh()).getSuggestModel()
    await m.generateContent('a')
    authCb()
    await m.generateContent('b')
    expect(getDoc).toHaveBeenCalledTimes(2)
  })
  it('호출 직전에 관리자가 아니게 되면 키를 읽지 않고 실패한다', async () => {
    const m = (await fresh()).getSuggestModel()
    state.admin = false
    await expect(m.generateContent('a')).rejects.toThrow('unavailable')
    expect(getDoc).not.toHaveBeenCalled()
  })
})

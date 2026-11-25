import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const auth = { isAdmin: false, signOut: () => {} }
vi.mock('../lib/auth.jsx', () => ({ useAuth: () => auth }))
// 이 테스트는 메뉴만 본다. 화면 바탕을 바꾸는 theme 모듈은 불러오지 않는다.
vi.mock('./ThemeSwitch.jsx', () => ({ default: () => null }))

import HmTop from './HmTop.jsx'

const html = () => renderToString(<StaticRouter location="/"><HmTop /></StaticRouter>)

describe('상단 메뉴의 글 작성하기', () => {
  it('방문자에게는 보이지 않는다', () => {
    auth.isAdmin = false
    const out = html()
    expect(out).not.toContain('글 작성하기')
    expect(out).toContain('전체 글')
  })
  it('관리자에게는 보인다', () => {
    auth.isAdmin = true
    expect(html()).toContain('글 작성하기')
  })
})

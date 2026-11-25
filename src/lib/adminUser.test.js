import { describe, expect, it } from 'vitest'
import { isAllowedUser } from './adminUser.js'

describe('isAllowedUser', () => {
  it('구글 로그인은 인증된 관리자 이메일만 통과한다', () => {
    expect(isAllowedUser({ emailVerified: true, email: 'Me@Example.com' }, 'me@example.com')).toBe(true)
    expect(isAllowedUser({ emailVerified: true, email: 'x@y.com' }, 'me@example.com')).toBe(false)
    expect(isAllowedUser({ emailVerified: false, email: 'me@example.com' }, 'me@example.com')).toBe(false)
  })
  it('이메일/비밀번호 계정은 화면에서 통과하고 로그아웃 상태는 막는다', () => {
    expect(isAllowedUser({ providerData: [{ providerId: 'password' }], email: 't@t.com' }, 'me@example.com')).toBe(true)
    expect(isAllowedUser(null, 'me@example.com')).toBe(false)
  })
})

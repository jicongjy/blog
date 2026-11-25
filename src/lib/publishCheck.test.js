import { describe, expect, it } from 'vitest'
import { checkBeforePublish } from './publishCheck.js'

const ok = { title: '제목', excerpt: '요약', category: '기획', thumbnail: 'https://example.com/a.png' }

describe('checkBeforePublish (F2)', () => {
  it('모두 채워져 있으면 막지도 알리지도 않는다', () => {
    expect(checkBeforePublish(ok)).toEqual({ blocking: [], warnings: [] })
  })
  it('제목, 요약, 카테고리가 비면 발행을 막고 어느 항목인지 알려 준다', () => {
    expect(checkBeforePublish({ ...ok, title: '', excerpt: '  ', category: '' }).blocking).toEqual(['제목', '요약', '카테고리'])
  })
  it('표지가 비면 막지 않고 알리기만 한다', () => {
    expect(checkBeforePublish({ ...ok, thumbnail: '' })).toEqual({ blocking: [], warnings: ['표지'] })
  })
  it('값이 없거나 공백뿐이어도 오류 없이 비어 있다고 본다', () => {
    expect(checkBeforePublish({}).blocking).toEqual(['제목', '요약', '카테고리'])
    expect(checkBeforePublish({ ...ok, title: '   ' }).blocking).toEqual(['제목'])
  })
})

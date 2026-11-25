import { describe, expect, it } from 'vitest'
import { fixPastedMarkdown, toHtml } from './body.js'

describe('붙여 넣은 마크다운 변환', () => {
  it('제목, 인용을 바꾼다', () => {
    expect(fixPastedMarkdown('<p>## 소제목</p>')).toBe('<h2>소제목</h2>')
    expect(fixPastedMarkdown('<p>### 작은 제목</p>')).toBe('<h3>작은 제목</h3>')
    expect(fixPastedMarkdown('<p>&gt; 인용문</p>')).toBe('<blockquote><p>인용문</p></blockquote>')
  })
  it('이어진 항목은 목록 하나로 묶는다', () => {
    expect(fixPastedMarkdown('<p>- 가</p><p>- 나</p>')).toBe('<ul><li><p>가</p></li><li><p>나</p></li></ul>')
    expect(fixPastedMarkdown('<p>1. 하나</p><p>2. 둘</p>')).toBe('<ol><li><p>하나</p></li><li><p>둘</p></li></ol>')
  })
  it('목록 사이에 일반 문단이 있으면 목록을 나눈다', () => {
    expect(fixPastedMarkdown('<p>- 가</p><p>중간</p><p>- 나</p>')).toBe('<ul><li><p>가</p></li></ul><p>중간</p><ul><li><p>나</p></li></ul>')
  })
  it('일반 문장은 건드리지 않는다', () => {
    for (const t of ['<p>-하이픈 붙은 글</p>', '<p>2026. 11월 기록</p>x', '<p>가운데 ## 기호</p>', '<p>평범한 문장입니다.</p>']) {
      expect(fixPastedMarkdown(t)).toBe(t)
    }
  })
  it('굵게와 코드는 안에서도 바뀐다', () => {
    expect(fixPastedMarkdown('<p>## **핵심** 과 `코드`</p>')).toBe('<h2><strong>핵심</strong> 과 <code>코드</code></h2>')
  })
  it('이미 제대로 된 HTML은 그대로 둔다', () => {
    const ok = '<h2>제목</h2><p>본문</p><ul><li><p>항목</p></li></ul>'
    expect(toHtml(ok)).toBe(ok)
  })
  it('예전 마크다운 글은 기존처럼 변환된다', () => {
    expect(toHtml('## 제목\n\n본문')).toBe('<h2>제목</h2><p>본문</p>')
  })
})

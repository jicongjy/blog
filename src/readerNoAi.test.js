import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// F3: 독자가 보는 화면에서는 AI를 부르지 않는다. 요약은 글에 저장된 값만 보여 준다.
describe('독자 화면은 AI 모듈을 쓰지 않는다', () => {
  for (const f of ['pages/Home.jsx', 'pages/List.jsx', 'pages/Post.jsx']) {
    it(f, () => {
      const src = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8')
      expect(src).not.toMatch(/lib\/(ai|suggest)\.js/)
    })
  }
})

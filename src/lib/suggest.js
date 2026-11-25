// 에디터의 AI 제안(F1). 제목, 요약, 카테고리를 한 번에 한 개씩 받는다(PRD 6.4, D30).
// 보내는 것은 제목, 본문, 카테고리 이름뿐이다(D17).
import { AI_TIMEOUT_MS, getSuggestModel } from './ai.js'

// 글 한 편에서 제안을 부를 수 있는 횟수(PRD 6.4)
export const MAX_CALLS = 5

// 에디터의 본문(HTML)을 AI에 보낼 글자로 바꾼다.
export function htmlToText(html = '') {
  if (typeof DOMParser === 'undefined') return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const doc = new DOMParser().parseFromString(String(html), 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

// previous: 이 글에서 이미 나온 제안 [{ title, excerpt }]. 다시 받을 때 같은 답이 반복되지 않게 함께 보낸다.
export function buildPrompt({ title, text, categories, previous = [] }) {
  const earlier = previous.filter((p) => p?.title || p?.excerpt)
  return [
    '너는 개인 블로그의 편집 보조다. 아래 글을 읽고 제목, 요약, 카테고리를 한 개씩 제안해라.',
    '읽는 사람은 서비스 기획에 관심 있는 사람이나 기획자를 뽑는 사람이다. 제목만 보고 이 글에서 무엇을 얻는지 알 수 있어야 한다.',
    '규칙:',
    '- 본문에 없는 내용은 쓰지 않는다. 글을 대신 쓰지 않는다.',
    '- 제목은 25자 안팎의 한 줄로, 읽는 사람이 얻는 것(알게 되는 것, 판단 기준, 풀리는 고민)을 쓴다.',
    '- 전문 용어는 쓰지 않거나 쉬운 말로 풀어 쓴다. 처음 듣는 사람도 뜻이 통해야 한다.',
    '- 제목은 한 가지 이야기만 담은 짧은 말 하나로 쓴다. "~하는지 정하는 기준"처럼 절을 겹쳐 쓰지 않는다. 소리 내어 읽었을 때 자연스러운 말투여야 한다.',
    '- 요약은 120자 안팎, 두 문장 이하로 쓴다.',
    `- 카테고리는 다음 목록 중 하나만 고른다: ${categories.join(', ')}`,
    '- 한국어로 쓰고 요약 문장은 "~다"로 끝낸다. 이모지와 장식 기호를 쓰지 않는다.',
    '',
    `현재 제목: ${title || '(없음)'}`,
    '',
    ...(earlier.length
      ? [
          '이미 나온 제안(아래와 같거나 비슷한 제목과 요약은 쓰지 않고, 다른 관점이나 표현으로 새로 제안한다):',
          ...earlier.map((p, i) => `${i + 1}. 제목: ${p.title} / 요약: ${p.excerpt}`),
          '',
        ]
      : []),
    '본문:',
    text,
  ].join('\n')
}

// 모델이 준 값을 화면에 쓸 수 있는 모양으로 다듬는다. 목록에 없는 카테고리는 비운다.
export function normalizeSuggestion(raw, categories) {
  const str = (v) => (typeof v === 'string' ? v.trim() : '')
  const category = str(raw?.category)
  return {
    title: str(raw?.title),
    excerpt: str(raw?.excerpt),
    category: categories.includes(category) ? category : '',
  }
}

function withTimeout(promise, ms) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

// 응답 형식: 제목, 요약, 카테고리를 담은 JSON 한 개
const schema = {
  type: 'object',
  properties: { title: { type: 'string' }, excerpt: { type: 'string' }, category: { type: 'string' } },
  required: ['title', 'excerpt', 'category'],
}

// 성공하면 { title, excerpt, category, ms }, 실패하면 예외를 던진다(F6).
export async function requestSuggestion({ title, body, categories, previous = [] }) {
  const model = getSuggestModel({ responseMimeType: 'application/json', responseSchema: schema })
  if (!model) throw new Error('unavailable')
  const t0 = performance.now()
  const result = await withTimeout(model.generateContent(buildPrompt({ title, text: htmlToText(body), categories, previous })), AI_TIMEOUT_MS)
  const data = normalizeSuggestion(JSON.parse(result.response.text()), categories)
  return { ...data, ms: Math.round(performance.now() - t0) }
}

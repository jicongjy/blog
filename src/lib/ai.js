// AI 연결. 키는 코드와 배포 파일에 두지 않고, Firestore의 settings/ai 문서(apiKey 필드)에 둔다.
// 이 문서는 보안 규칙으로 관리자 계정만 읽을 수 있다(firestore.rules). 방문자는 읽을 수 없다.
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { isAllowedUser } from './adminUser.js'
import { ADMIN_EMAIL, auth, db } from './firebase.js'

// 모델은 가장 가볍고 저렴한 Claude 모델로 정했다(의사결정 로그 D35).
export const AI_MODEL = 'claude-haiku-5-5'
// PRD 6.4: 10초 안에 끝나지 않으면 실패로 본다(F6).
export const AI_TIMEOUT_MS = 10_000
const ENDPOINT = 'https://api.anthropic.com/v1/messages'

export const aiEnabled = Boolean(db)

// 화면 쪽 관리자 확인(F5). 키 문서는 규칙으로도 관리자만 읽을 수 있어서, 관리자가 아니면 키를 받지 못한다.
export function isAdminUser() {
  return isAllowedUser(auth?.currentUser, ADMIN_EMAIL)
}

let keyPromise = null
// 로그인 상태가 바뀌면(로그아웃 포함) 메모리의 키를 버린다.
if (auth) onAuthStateChanged(auth, () => { keyPromise = null })

// 키는 한 번 읽어 이 화면이 열려 있는 동안만 메모리에 둔다. 저장소나 화면에는 남기지 않는다.
// 밖에서 직접 부르지 못하도록 내보내지 않고, 읽기 전에 관리자인지 다시 확인한다.
function readApiKey() {
  if (!isAdminUser()) return Promise.reject(new Error('unavailable'))
  keyPromise ??= getDoc(doc(db, 'settings', 'ai')).then((snap) => {
    const key = snap.exists() ? String(snap.data().apiKey ?? '').trim() : ''
    if (!key) throw new Error('unavailable')
    return key
  })
  keyPromise.catch(() => { keyPromise = null }) // 실패하면 다음 호출에서 다시 읽는다
  return keyPromise
}

// 제안 기능이 쓰는 모델. 응답 형식(responseSchema)을 도구 하나로 강제해서 JSON 글자로 돌려준다.
// 브라우저에서 직접 부르므로 anthropic-dangerous-direct-browser-access 헤더가 필요하다. 키는 관리자만 읽을 수 있다.
export function getSuggestModel(generationConfig = {}) {
  if (!aiEnabled || !isAdminUser()) return null
  return {
    async generateContent(prompt) {
      const key = await readApiKey()
      const schema = generationConfig.responseSchema
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
          tools: [{ name: 'suggest', description: '제목, 요약, 카테고리 제안', input_schema: schema }],
          tool_choice: { type: 'tool', name: 'suggest' },
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`http ${res.status}`)
      const data = await res.json()
      const input = data?.content?.find((c) => c.type === 'tool_use')?.input
      return { response: { text: () => JSON.stringify(input ?? {}) } }
    },
  }
}

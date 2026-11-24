// Firebase AI Logic(Agent Platform Gemini API, 후불 종량제) 연결. 제안 기능(F1)은 이 모델을 가져다 쓴다.
// 호출은 관리자 화면에서만 하고, App Check를 통과한 요청만 서버가 받는다(firebase.js).
import { getAI, getGenerativeModel, AgentPlatformBackend } from 'firebase/ai'
import { app, appCheckEnabled } from './firebase.js'

// 모델은 안정(Stable) 버전인 저비용 모델로 정했다(의사결정 로그 D32).
export const AI_MODEL = 'gemini-3.5-flash-lite'
// PRD 6.4: 10초 안에 끝나지 않으면 실패로 본다(F6).
export const AI_TIMEOUT_MS = 10_000

export const aiEnabled = Boolean(app && appCheckEnabled)

export function getSuggestModel(generationConfig = {}) {
  if (!aiEnabled) return null
  const ai = getAI(app, { backend: new AgentPlatformBackend() })
  return getGenerativeModel(ai, { model: AI_MODEL, generationConfig }, { timeout: AI_TIMEOUT_MS })
}

// Firebase AI Logic(Agent Platform Gemini API, 후불 종량제) 연결. 제안 기능(F1)은 이 모델을 가져다 쓴다.
// 호출은 관리자 화면에서만 하고, App Check를 통과한 요청만 서버가 받는다(firebase.js).
import { getAI, getGenerativeModel, AgentPlatformBackend } from 'firebase/ai'
import { ADMIN_EMAIL, app, appCheckEnabled, auth } from './firebase.js'

// 모델은 안정(Stable) 버전인 저비용 모델로 정했다(의사결정 로그 D32).
export const AI_MODEL = 'gemini-3.5-flash-lite'
// PRD 6.4: 10초 안에 끝나지 않으면 실패로 본다(F6).
export const AI_TIMEOUT_MS = 10_000

export const aiEnabled = Boolean(app && appCheckEnabled)

// 화면 쪽 관리자 확인(F5). 서버는 App Check만 확인하므로, 관리자 계정까지 서버에서 가려내지는 못한다(D34).
// 그 위험은 서비스별 월 지출 한도와 호출 횟수 제한으로 줄인다.
export function isAdminUser() {
  const u = auth?.currentUser
  return Boolean(u && u.emailVerified && ADMIN_EMAIL && u.email?.toLowerCase() === ADMIN_EMAIL)
}

export function getSuggestModel(generationConfig = {}) {
  if (!aiEnabled || !isAdminUser()) return null
  const ai = getAI(app, { backend: new AgentPlatformBackend() })
  return getGenerativeModel(ai, { model: AI_MODEL, generationConfig }, { timeout: AI_TIMEOUT_MS })
}

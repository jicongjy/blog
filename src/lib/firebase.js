// Firebase 초기화. .env(또는 GitHub 저장소 Variables)에 설정값이 있을 때만 켜진다.
// 설정값이 없으면 firebaseEnabled=false 이고, 글 저장·로그인은 브라우저 임시 구현으로 동작한다.
import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(config.apiKey && config.projectId && config.appId)
export const ADMIN_EMAIL = (env.VITE_ADMIN_EMAIL || '').trim().toLowerCase()

export const app = firebaseEnabled ? initializeApp(config) : null

// App Check: Firebase AI Logic은 App Check를 통과한 요청만 받는다. 배포본은 Fraud Defense(reCAPTCHA Enterprise) 사이트 키로 증명한다.
// 사이트 키는 공개되어도 되는 값이라 환경 변수로 넣는다. 비밀 키는 쓰지 않는다.
// 개발 서버(localhost)에서는 디버그 토큰을 쓴다. 콘솔에 한 번 출력되는 토큰을 Firebase 콘솔 > App Check > 앱 > 디버그 토큰 관리에 등록한다.
// 디버그 토큰은 저장소에 올리지 않는다.
const recaptchaSiteKey = (env.VITE_RECAPTCHA_SITE_KEY || '').trim()
export const appCheckEnabled = Boolean(app && (recaptchaSiteKey || import.meta.env.DEV))
if (app && appCheckEnabled) {
  if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  // 개발 서버의 핫 리로드가 이 파일을 다시 실행해도 초기화가 한 번만 되도록 한다.
  if (!globalThis.__appCheckInitialized) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey || 'dev-only'),
      isTokenAutoRefreshEnabled: true,
    })
    globalThis.__appCheckInitialized = true
  }
}
export const auth = app ? getAuth(app) : null
// 기존 프로젝트의 기본 데이터베이스와 규칙이 섞이지 않도록, 값이 있으면 별도 데이터베이스(예: blog)를 쓴다.
const databaseId = (env.VITE_FIREBASE_DATABASE_ID || '').trim()
export const db = app ? (databaseId ? getFirestore(app, databaseId) : getFirestore(app)) : null

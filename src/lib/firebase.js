// Firebase 초기화. .env(또는 GitHub 저장소 Variables)에 설정값이 있을 때만 켜진다.
// 설정값이 없으면 firebaseEnabled=false 이고, 글 저장·로그인은 브라우저 임시 구현으로 동작한다.
import { initializeApp } from 'firebase/app'
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

const app = firebaseEnabled ? initializeApp(config) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

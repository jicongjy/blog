// 좋아요, 스크랩. Firebase 설정이 있으면 Firestore(posts/{글ID}/reactions/{사용자ID}), 없으면 브라우저 localStorage 임시 저장.
// 방문자는 Firebase 익명 인증으로 구분하며, 반응을 처음 누를 때만 익명 계정을 만든다. (로그인이 필요 없다)
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { auth, db, firebaseEnabled } from '../lib/firebase.js'

const none = { like: false, scrap: false }

// 아바타를 그리는 외부 서비스와 화면에는 계정 ID를 그대로 넘기지 않고, 되돌릴 수 없는 짧은 값으로 바꿔 넘긴다.
// 같은 계정은 항상 같은 값이 나와서 얼굴은 유지된다.
async function token(uid) {
  const text = `avatar:${uid}`
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  let h = 5381
  for (const c of text) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0 // 보안 문맥이 아닐 때의 대체(로컬 확인용)
  return h.toString(16)
}
const count = (docs) => ({
  like: docs.filter((d) => d.like).length,
  scrap: docs.filter((d) => d.scrap).length,
})

/* ---------- 임시(localStorage) 구현 ---------- */
const lkey = (id) => `blog:reactions:${id}`
function lload(id) {
  try {
    return JSON.parse(localStorage.getItem(lkey(id))) ?? none
  } catch {
    return none
  }
}

async function currentUid({ create }) {
  await auth.authStateReady()
  if (auth.currentUser) return auth.currentUser.uid
  if (!create) return null
  return (await signInAnonymously(auth)).user.uid
}

// 개수와 내 반응. 실패하면 null (규칙 미적용, 익명 인증 꺼짐 등) 이라서 화면에서 버튼을 숨긴다.
export async function loadReactions(postId) {
  if (!firebaseEnabled) {
    const mine = lload(postId)
    return { counts: { like: mine.like ? 1 : 0, scrap: mine.scrap ? 1 : 0 }, mine, likers: mine.like ? [await token('me')] : [] }
  }
  try {
    const snap = await getDocs(collection(db, 'posts', postId, 'reactions'))
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const uid = await currentUid({ create: false })
    const mine = uid ? docs.find((d) => d.id === uid) : null
    // 좋아요를 누른 사람들. 최근에 누른 순서이며, 계정 ID가 아니라 아바타용 값만 화면으로 넘긴다.
    const likers = await Promise.all(
      docs
        .filter((d) => d.like)
        .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))
        .map((d) => token(d.id)),
    )
    return { counts: count(docs), mine: { like: Boolean(mine?.like), scrap: Boolean(mine?.scrap) }, likers }
  } catch {
    return null
  }
}

// 내 반응을 저장한다. 둘 다 꺼지면 문서를 지운다. 성공하면 내 아바타용 값, 실패하면 null.
export async function saveMine(postId, mine) {
  if (!firebaseEnabled) {
    try {
      localStorage.setItem(lkey(postId), JSON.stringify(mine))
      return await token('me')
    } catch {
      return null
    }
  }
  try {
    const uid = await currentUid({ create: true })
    const ref = doc(db, 'posts', postId, 'reactions', uid)
    if (!mine.like && !mine.scrap) await deleteDoc(ref)
    else await setDoc(ref, { like: mine.like, scrap: mine.scrap, updatedAt: new Date().toISOString() })
    return await token(uid)
  } catch {
    return null
  }
}

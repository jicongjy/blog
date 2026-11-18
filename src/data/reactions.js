// 좋아요, 스크랩. Firebase 설정이 있으면 Firestore(posts/{글ID}/reactions/{사용자ID}), 없으면 브라우저 localStorage 임시 저장.
// 방문자는 Firebase 익명 인증으로 구분하며, 반응을 처음 누를 때만 익명 계정을 만든다. (로그인이 필요 없다)
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { auth, db, firebaseEnabled } from '../lib/firebase.js'

const none = { like: false, scrap: false }
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
    return { counts: { like: mine.like ? 1 : 0, scrap: mine.scrap ? 1 : 0 }, mine }
  }
  try {
    const snap = await getDocs(collection(db, 'posts', postId, 'reactions'))
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const uid = await currentUid({ create: false })
    const mine = uid ? docs.find((d) => d.id === uid) : null
    return { counts: count(docs), mine: { like: Boolean(mine?.like), scrap: Boolean(mine?.scrap) } }
  } catch {
    return null
  }
}

// 내 반응을 저장한다. 둘 다 꺼지면 문서를 지운다. 실패하면 false.
export async function saveMine(postId, mine) {
  if (!firebaseEnabled) {
    try {
      localStorage.setItem(lkey(postId), JSON.stringify(mine))
      return true
    } catch {
      return false
    }
  }
  try {
    const uid = await currentUid({ create: true })
    const ref = doc(db, 'posts', postId, 'reactions', uid)
    if (!mine.like && !mine.scrap) await deleteDoc(ref)
    else await setDoc(ref, { like: mine.like, scrap: mine.scrap, updatedAt: new Date().toISOString() })
    return true
  } catch {
    return false
  }
}

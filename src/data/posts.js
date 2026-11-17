// 글 저장소. Firebase 설정이 있으면 Firestore(posts 컬렉션), 없으면 브라우저 localStorage 임시 저장.
// 화면 코드는 이 파일의 함수만 부른다.
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db, firebaseEnabled } from '../lib/firebase.js'
import { samples } from './samples.js'

const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
const isPublic = (p) => p.status === 'published' && p.visibility === 'public'

/* ---------- 임시(localStorage) 구현 ---------- */
const KEY = 'blog:posts:v3'
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* 저장소를 못 쓰면 샘플만 보여 준다 */
  }
  return samples
}
function persist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* 무시 */
  }
}

/* ---------- 공통 함수 ---------- */
// 관리자가 아니면 발행된 공개 글만 보인다. (Firestore 규칙도 같은 조건으로 읽기를 허용한다)
export async function listPosts({ isAdmin = false } = {}) {
  if (!firebaseEnabled) return load().filter((p) => isAdmin || isPublic(p)).sort(byDate)
  const col = collection(db, 'posts')
  const q = isAdmin ? col : query(col, where('status', '==', 'published'), where('visibility', '==', 'public'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byDate)
}

export async function getPost(id) {
  if (!firebaseEnabled) return load().find((p) => p.id === id) ?? null
  try {
    const snap = await getDoc(doc(db, 'posts', id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch {
    return null // 권한이 없는 글(비공개·임시저장)은 없는 글처럼 처리한다
  }
}

export async function savePost(post) {
  const now = new Date().toISOString()
  if (!firebaseEnabled) {
    const list = load()
    const id = post.id ?? `post-${Date.now()}`
    const prev = list.find((p) => p.id === id)
    const next = { ...prev, ...post, id, createdAt: prev?.createdAt ?? now, updatedAt: now }
    persist(prev ? list.map((p) => (p.id === id ? next : p)) : [next, ...list])
    return next
  }
  const ref = post.id ? doc(db, 'posts', post.id) : doc(collection(db, 'posts'))
  const prevSnap = post.id ? await getDoc(ref) : null
  const { id: _omit, ...fields } = post
  const data = { ...fields, createdAt: prevSnap?.exists() ? prevSnap.data().createdAt : now, updatedAt: now }
  await setDoc(ref, data)
  return { id: ref.id, ...data }
}

export async function removePost(id) {
  if (!firebaseEnabled) return persist(load().filter((p) => p.id !== id))
  await deleteDoc(doc(db, 'posts', id))
}

// 카테고리 저장소. Firebase 설정이 있으면 Firestore(categories 컬렉션), 없으면 브라우저 localStorage.
// 글(posts)에는 카테고리 이름이 문자열로 저장된다.
import { collection, deleteDoc, doc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore'
import { db, firebaseEnabled } from '../lib/firebase.js'
import { listPosts, renameCategoryInLocalPosts } from './posts.js'

// Firebase를 아직 읽지 못하는 로컬 미리보기에서도 실제 기본 분류와 같은 이름을 쓴다.
export const DEFAULT_CATEGORIES = ['기획', '설계', '운영']
const KEY = 'blog:categories:v1'
const byOrder = (a, b) => a.order - b.order

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* 저장소를 못 쓰면 기본값만 보여 준다 */
  }
  return DEFAULT_CATEGORIES.map((name, i) => ({ id: `c${i + 1}`, name, order: i + 1 }))
}
function persist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* 무시 */
  }
}

export async function listCategories() {
  if (!firebaseEnabled) return load().sort(byOrder)
  const snap = await getDocs(collection(db, 'categories'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder)
}

// 비어 있을 때 기본 카테고리를 만든다. (관리자만 호출)
export async function seedCategories() {
  if (!firebaseEnabled) return listCategories()
  const batch = writeBatch(db)
  DEFAULT_CATEGORIES.forEach((name, i) => batch.set(doc(collection(db, 'categories')), { name, order: i + 1 }))
  await batch.commit()
  return listCategories()
}

const clean = (name) => name.trim().replace(/\s+/g, ' ')

export async function addCategory(rawName) {
  const name = clean(rawName)
  if (!name) throw new Error('이름을 입력해 주세요.')
  const list = await listCategories()
  if (list.some((c) => c.name === name)) throw new Error('이미 있는 카테고리입니다.')
  const order = Math.max(0, ...list.map((c) => c.order)) + 1
  if (!firebaseEnabled) {
    persist([...list, { id: `c${Date.now()}`, name, order }])
    return
  }
  await setDoc(doc(collection(db, 'categories')), { name, order })
}

// 이름을 바꾸면 그 카테고리를 쓰던 글도 함께 바꾼다.
export async function renameCategory(cat, rawName) {
  const name = clean(rawName)
  if (!name || name === cat.name) return
  const list = await listCategories()
  if (list.some((c) => c.name === name)) throw new Error('이미 있는 카테고리입니다.')
  if (!firebaseEnabled) {
    persist(list.map((c) => (c.id === cat.id ? { ...c, name } : c)))
    renameCategoryInLocalPosts(cat.name, name)
    return
  }
  const posts = await getDocs(query(collection(db, 'posts'), where('category', '==', cat.name)))
  const batch = writeBatch(db)
  batch.update(doc(db, 'categories', cat.id), { name })
  posts.docs.forEach((d) => batch.update(d.ref, { category: name }))
  await batch.commit()
}

export async function countPostsIn(name) {
  const posts = await listPosts({ isAdmin: true })
  return posts.filter((p) => p.category === name).length
}

export async function removeCategory(cat) {
  if ((await countPostsIn(cat.name)) > 0) throw new Error('이 카테고리를 쓰는 글이 있어 삭제할 수 없습니다. 글의 카테고리를 먼저 바꿔 주세요.')
  if (!firebaseEnabled) return persist((await listCategories()).filter((c) => c.id !== cat.id))
  await deleteDoc(doc(db, 'categories', cat.id))
}

// 순서를 한 칸 위(-1) 또는 아래(+1)로 옮긴다.
export async function moveCategory(cat, dir) {
  const list = await listCategories()
  const i = list.findIndex((c) => c.id === cat.id)
  const other = list[i + dir]
  if (!other) return
  if (!firebaseEnabled) {
    persist(list.map((c) => (c.id === cat.id ? { ...c, order: other.order } : c.id === other.id ? { ...c, order: cat.order } : c)))
    return
  }
  const batch = writeBatch(db)
  batch.update(doc(db, 'categories', cat.id), { order: other.order })
  batch.update(doc(db, 'categories', other.id), { order: cat.order })
  await batch.commit()
}

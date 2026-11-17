// 글 저장소. 지금은 브라우저 localStorage에 저장하는 임시 구현입니다.
// Firebase를 붙일 때는 이 파일의 함수 본문만 Firestore 호출로 바꾸면 화면 코드는 그대로입니다.
import { samples } from './samples.js'

const KEY = 'blog:posts:v2'

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

const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)

export async function listPosts({ includeDrafts = false } = {}) {
  return load()
    .filter((p) => includeDrafts || p.status === 'published')
    .sort(byDate)
}

export async function getPost(id) {
  return load().find((p) => p.id === id) ?? null
}

export async function savePost(post) {
  const list = load()
  const now = new Date().toISOString()
  const id = post.id ?? `post-${Date.now()}`
  const prev = list.find((p) => p.id === id)
  const next = { ...prev, ...post, id, createdAt: prev?.createdAt ?? now, updatedAt: now }
  persist(prev ? list.map((p) => (p.id === id ? next : p)) : [next, ...list])
  return next
}

export async function removePost(id) {
  persist(load().filter((p) => p.id !== id))
}

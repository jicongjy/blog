// 색 조합. 배경(bg)과 글자(fg) 두 색만 정하면 회색 단계는 두 색을 섞어서 자동으로 만든다.
// 임시 조합이므로 지영 님이 정한 조합으로 이 목록만 바꾸면 된다.
export const PALETTES = [
  { id: 'white', name: '흰색', bg: '#ffffff', fg: '#0a0a0a' },
  { id: 'black', name: '검정', bg: '#0d0d0d', fg: '#f2f2f2' },
  { id: 'paper', name: '종이', bg: '#f3efe6', fg: '#1a1a18' },
  { id: 'fog', name: '안개', bg: '#e4e6e8', fg: '#101214' },
  { id: 'moss', name: '이끼', bg: '#dfe5da', fg: '#1b2418' },
]

const KEY = 'blog:palette'

export function currentPalette() {
  let id = null
  try { id = localStorage.getItem(KEY) } catch { /* 저장소를 못 쓰면 기본값 */ }
  return PALETTES.find((p) => p.id === id) || PALETTES[0]
}

export function applyPalette(p, save = false) {
  const s = document.documentElement.style
  s.setProperty('--hm-bg', p.bg)
  s.setProperty('--hm-fg', p.fg)
  if (save) {
    try { localStorage.setItem(KEY, p.id) } catch { /* 무시 */ }
  }
}

// 화면이 그려지기 전에 저장된 색을 먼저 적용해서 깜빡임을 막는다.
applyPalette(currentPalette())

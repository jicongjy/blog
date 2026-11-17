// 색 조합. 배경(bg)과 글자(fg) 두 색만 정하면 회색 단계는 두 색을 섞어서 자동으로 만든다.
// 크림, 라벤더, 핑크, 라임, 초록, 빨강, 파랑은 사용자가 준 레퍼런스 이미지의 색(HEX)이다.
export const PALETTES = [
  { id: 'white', name: '흰색', bg: '#ffffff', fg: '#0a0a0a' },
  { id: 'black', name: '검정', bg: '#0d0d0d', fg: '#f2f2f2' },
  { id: 'cream', name: '크림', bg: '#f3eee8', fg: '#111111' },
  { id: 'lavender', name: '라벤더', bg: '#a785fe', fg: '#111111' },
  { id: 'pink', name: '핑크', bg: '#eaa9cb', fg: '#111111' },
  { id: 'lime', name: '라임', bg: '#d5ef72', fg: '#111111' },
  { id: 'green', name: '초록', bg: '#00b65c', fg: '#111111' },
  { id: 'red', name: '빨강', bg: '#f8311c', fg: '#111111' },
  { id: 'blue', name: '파랑', bg: '#537cde', fg: '#111111' },
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

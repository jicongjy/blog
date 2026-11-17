// 색 조합. 두 번째 레퍼런스의 왼쪽 바탕색(a)과 글자색(b)을 한 조합으로 쓴다.
// a는 화면 바탕과 스와치 점, b는 글자와 선택 상태에 쓴다.
export const PALETTES = [
  { id: 'mono', name: '모노톤', bg: '#f5f3ef', fg: '#161616', a: '#161616', b: '#f5f3ef' },
  { id: 'pink-blue', name: '핑크와 블루', bg: '#efa4aa', fg: '#0f3f93', a: '#efa4aa', b: '#155bc5' },
  { id: 'lilac-orange', name: '라일락과 오렌지', bg: '#b8a0ef', fg: '#64170d', a: '#b8a0ef', b: '#ed572d' },
  { id: 'lime-charcoal', name: '라임과 차콜', bg: '#c8f65a', fg: '#3d4434', a: '#c8f65a', b: '#3d4434' },
  { id: 'charcoal-lilac', name: '차콜과 라일락', bg: '#3d4434', fg: '#b8a0ef', a: '#3d4434', b: '#b8a0ef' },
  { id: 'orange-pink', name: '오렌지와 핑크', bg: '#ed572d', fg: '#3b0805', a: '#ed572d', b: '#efa4aa' },
  { id: 'blue-lilac', name: '블루와 라일락', bg: '#155bc5', fg: '#eee9ff', a: '#155bc5', b: '#b8a0ef' },
  { id: 'gray-lime', name: '그레이와 라임', bg: '#6e706a', fg: '#edff9a', a: '#7b7d76', b: '#d3fb5f' },
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
  s.setProperty('--palette-a', p.a)
  s.setProperty('--palette-b', p.b)
  if (save) {
    try { localStorage.setItem(KEY, p.id) } catch { /* 무시 */ }
  }
}

// 화면이 그려지기 전에 저장된 색을 먼저 적용해서 깜빡임을 막는다.
applyPalette(currentPalette())

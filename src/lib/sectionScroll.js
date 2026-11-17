// 홈 스크롤: 휠이나 방향키를 한 번 움직이면 첫 화면 -> 글 하나씩 -> 맨 아래로 부드럽게 한 칸씩 넘어간다.
// CSS scroll-snap 은 브라우저 기본 스크롤과 싸워서 끊겨 보이므로, 직접 애니메이션으로 옮긴다.
const DURATION = 600
const ease = (t) => 1 - Math.pow(1 - t, 4) // easeOutQuart: 바로 출발해서 부드럽게 멈춘다

export function startSectionScroll() {
  // 터치 기기와 모션 줄이기 설정에서는 기본 스크롤을 그대로 쓴다.
  if (!window.matchMedia('(pointer: fine)').matches) return () => {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  let animating = false
  let raf = 0
  let lastWheel = 0
  let lastAbs = 0

  const maxY = () => document.documentElement.scrollHeight - window.innerHeight
  const targets = () => {
    const y = window.scrollY
    const list = [0]
    document.querySelectorAll('.hm-entry').forEach((el) => list.push(Math.round(el.getBoundingClientRect().top + y - 48)))
    list.push(Math.round(maxY()))
    return [...new Set(list.map((v) => Math.max(0, Math.min(v, maxY()))))].sort((a, b) => a - b)
  }

  const go = (dir) => {
    const y = window.scrollY
    const list = targets()
    const next = dir > 0 ? list.find((t) => t > y + 4) : [...list].reverse().find((t) => t < y - 4)
    if (next === undefined) return
    const from = y
    const t0 = performance.now()
    animating = true
    cancelAnimationFrame(raf)
    const step = (now) => {
      const k = Math.min(1, (now - t0) / DURATION)
      window.scrollTo(0, from + (next - from) * ease(k))
      if (k < 1) raf = requestAnimationFrame(step)
      else animating = false
    }
    raf = requestAnimationFrame(step)
  }

  const onWheel = (e) => {
    if (e.ctrlKey) return // 확대 동작은 건드리지 않는다
    e.preventDefault()
    const now = performance.now()
    const abs = Math.abs(e.deltaY)
    const gap = now - lastWheel
    // 트랙패드의 관성 스크롤이 이어서 한 칸 더 넘기지 않도록, 움직임이 멈췄거나 새로 힘이 붙었을 때만 받는다.
    const fresh = gap > 80 || abs > lastAbs + 8
    lastWheel = now
    lastAbs = abs
    if (animating || !fresh || abs < 2) return
    go(e.deltaY > 0 ? 1 : -1)
  }

  const onKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const t = e.target
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
    const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)
    const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)
    if (!down && !up) return
    e.preventDefault()
    if (!animating) go(down ? 1 : -1)
  }

  // 스크롤바를 직접 끌거나 링크로 이동하면 애니메이션을 멈춘다.
  const onDown = () => {
    cancelAnimationFrame(raf)
    animating = false
  }

  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerdown', onDown)
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('pointerdown', onDown)
  }
}

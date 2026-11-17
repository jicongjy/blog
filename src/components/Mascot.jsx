import { useEffect, useRef } from 'react'

const EYES = [
  { cx: 54, cy: 32 },
  { cx: 78, cy: 32 },
]
const REACH = 2.8 // 눈동자가 흰자 안에서 움직일 수 있는 최대 거리

// 마우스 포인터를 눈이 따라간다.
export default function Mascot() {
  const svg = useRef(null)
  const pupils = useRef([])

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const move = (e) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = svg.current?.getBoundingClientRect()
        if (!box) return
        const k = box.width / 104
        EYES.forEach((eye, i) => {
          const dx = e.clientX - (box.left + eye.cx * k)
          const dy = e.clientY - (box.top + eye.cy * k)
          const d = Math.hypot(dx, dy) || 1
          const r = Math.min(REACH, d / 12)
          pupils.current[i]?.setAttribute('transform', `translate(${((dx / d) * r).toFixed(2)} ${((dy / d) * r).toFixed(2)})`)
        })
      })
    }
    window.addEventListener('mousemove', move)
    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <svg ref={svg} aria-hidden="true" width="104" height="64" viewBox="0 0 104 64">
      <path d="M52.2 -16.9 C81.2 -34.2 112.2 2 115 32 C118 64 87.5 91 55.5 87.2 C21.5 83.2 8 80.1 12 50.1 C12.9 43.3 19.6 29.3 19.1 23 C16.8 -5.2 36.8 -7.7 52.2 -16.9 Z" fill="#0a0a0a" />
      {EYES.map((e) => (
        <circle key={`w${e.cx}`} cx={e.cx} cy={e.cy} r="6.5" fill="#f5f5f5" />
      ))}
      {EYES.map((e, i) => (
        <circle key={`p${e.cx}`} ref={(el) => (pupils.current[i] = el)} cx={e.cx} cy={e.cy} r="3" fill="#0a0a0a" />
      ))}
      <path d="M57 50 Q66 52 75 50" fill="none" stroke="#f5f5f5" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}

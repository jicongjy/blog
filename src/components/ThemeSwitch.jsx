import { useEffect, useRef, useState } from 'react'
import { PALETTES, applyPalette, currentPalette } from '../lib/theme.js'
import { track } from '../lib/analytics.js'

// 상단 브랜드 오른쪽의 원 하나. 누르면 색 조합 원들이 세로로 차례로 나타난다.
export default function ThemeSwitch() {
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState(() => currentPalette())
  const box = useRef(null)

  useEffect(() => {
    if (!open) return
    const off = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', off)
    return () => document.removeEventListener('pointerdown', off)
  }, [open])

  const choose = (p) => {
    applyPalette(p, true)
    setCur(p)
    track('select_palette', { palette: p.id })
  }

  return (
    <div className="ts" ref={box}>
      <button type="button" className="ts-dot ts-cur" style={{ '--a': cur.bg, '--b': cur.fg }} aria-label="색 조합 바꾸기" aria-expanded={open} onClick={() => setOpen((v) => !v)} />
      {open && (
        <ul className="ts-list" aria-label="색 조합">
          {PALETTES.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className={`ts-dot${cur.id === p.id ? ' on' : ''}`}
                style={{ '--a': p.bg, '--b': p.fg, '--i': i }}
                aria-label={p.name}
                aria-pressed={cur.id === p.id}
                onClick={() => choose(p)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

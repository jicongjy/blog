import { useEffect, useRef, useState } from 'react'
import { PALETTES, applyPalette, currentPalette } from '../lib/theme.js'
import { track } from '../lib/analytics.js'

// 상단 브랜드 옆에서 오른쪽으로만 펼쳐지는 점 스와치.
export default function ThemeSwitch() {
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState(() => currentPalette())
  const box = useRef(null)

  useEffect(() => {
    if (!open) return
    const off = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    const escape = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', off)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', off)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const choose = (p) => {
    if (p.id === cur.id) {
      setOpen(false)
      return
    }
    applyPalette(p, true)
    setCur(p)
    track('select_palette', { palette: p.id })
    setOpen(false)
  }

  return (
    <div className="ts" ref={box}>
      <button
        type="button"
        className="ts-trigger"
        style={{ '--a': cur.a, '--b': cur.b }}
        aria-label={`색 조합 바꾸기, 현재 ${cur.name}`}
        aria-expanded={open}
        aria-controls="palette-swatches"
        onClick={() => setOpen((v) => !v)}
      />

      <div className={`ts-swatches${open ? ' open' : ''}`} id="palette-swatches" aria-label="색 조합" aria-hidden={!open}>
        {PALETTES.filter((p) => p.id !== cur.id).map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="ts-dot"
            style={{ '--a': p.a, '--b': p.b, '--i': i }}
            aria-label={p.name}
            tabIndex={open ? 0 : -1}
            onClick={() => choose(p)}
          />
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { PALETTES, applyPalette, currentPalette } from '../lib/theme.js'
import { track } from '../lib/analytics.js'

// 왼쪽 아래 해 아이콘. 누르면 색 조합이 세로로 펼쳐진다.
export default function ThemeSwitch() {
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState(() => currentPalette().id)

  const choose = (p) => {
    applyPalette(p, true)
    setCur(p.id)
    track('select_palette', { palette: p.id })
  }

  return (
    <div className="ts">
      {open && (
        <ul className="ts-list" aria-label="색 조합">
          {PALETTES.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`ts-dot${cur === p.id ? ' on' : ''}`}
                style={{ '--a': p.bg, '--b': p.fg }}
                aria-label={p.name}
                aria-pressed={cur === p.id}
                onClick={() => choose(p)}
              />
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="ts-sun" aria-label="색 조합 바꾸기" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
        </svg>
      </button>
    </div>
  )
}

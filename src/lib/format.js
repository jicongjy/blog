export const fmtDate = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}.`
}
import { plainText } from './body.js'
export const readMinutes = (text = '') => Math.max(1, Math.round(plainText(text).replace(/\s/g, '').length / 500))
export const pad = (n) => String(n).padStart(2, '0')
export const noOf = (posts, p) => pad(posts.length - posts.indexOf(p))

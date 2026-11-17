import DOMPurify from 'dompurify'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(text) {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${/^(https?:|mailto:|#|\/)/.test(href) ? href : '#'}">${label}</a>`)
}

// 예전 마크다운으로 저장된 글을 HTML로 바꾼다.
function mdToHtml(source = '') {
  return source
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((b) => {
      if (b.startsWith('### ')) return `<h3>${inline(b.slice(4))}</h3>`
      if (b.startsWith('## ')) return `<h2>${inline(b.slice(3))}</h2>`
      if (b.startsWith('> ')) return `<blockquote><p>${inline(b.replace(/^>\s?/gm, ''))}</p></blockquote>`
      if (/^- /.test(b)) return `<ul>${b.split('\n').map((l) => `<li><p>${inline(l.replace(/^- /, ''))}</p></li>`).join('')}</ul>`
      return `<p>${inline(b)}</p>`
    })
    .join('')
}

const isHtml = (s = '') => /^\s*</.test(s)

// 저장된 본문(HTML 또는 예전 마크다운)을 항상 HTML로 돌려준다.
export const toHtml = (body = '') => (isHtml(body) ? body : mdToHtml(body))

// 화면에 그릴 때는 허용된 태그만 남긴다.
export const safeHtml = (body = '') =>
  DOMPurify.sanitize(toHtml(body), {
    ALLOWED_TAGS: ['p', 'br', 'h2', 'h3', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
  })

// 글자 수 계산용: 태그를 지운 본문
export const plainText = (body = '') => toHtml(body).replace(/<[^>]*>/g, ' ')

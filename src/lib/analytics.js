// Google Analytics 4. 측정 ID가 있고 배포본일 때만 켜진다. (로컬 개발과 미리보기는 집계하지 않는다)
// 해시 주소(#/post/...)는 GA가 구분하지 못해서, 화면 이동마다 가상의 경로로 page_view를 직접 보낸다.
const ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim()
const OWNER_KEY = 'blog:no-track'
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') // 예: /blog

export const gaEnabled = Boolean(ID) && import.meta.env.PROD

function isOwner() {
  try {
    return localStorage.getItem(OWNER_KEY) === '1'
  } catch {
    return false
  }
}

let started = false
export function initAnalytics() {
  if (!gaEnabled || started) return
  started = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  if (isOwner()) window[`ga-disable-${ID}`] = true
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`
  document.head.appendChild(s)
  window.gtag('js', new Date())
  window.gtag('config', ID, { send_page_view: false })
}

// 관리자 본인의 방문은 집계하지 않는다. 이 브라우저에 표시를 남긴다.
export function markOwner() {
  if (!gaEnabled) return
  try {
    localStorage.setItem(OWNER_KEY, '1')
  } catch {
    /* 무시 */
  }
  window[`ga-disable-${ID}`] = true
}

// path: 앱 안의 경로(예: /post/abc). extra: 추가 매개변수(post_id 등)
export function pageView(path, title, extra = {}) {
  if (!gaEnabled || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: `${window.location.origin}${BASE}${path}`,
    ...extra,
  })
}

export function track(name, params = {}) {
  if (!gaEnabled || !window.gtag) return
  window.gtag('event', name, params)
}

// Google Analytics 4. 측정 ID가 있고 배포본일 때만 켜진다. (로컬 개발과 미리보기는 집계하지 않는다)
// 화면 이동은 새로고침 없이 일어나서 GA 기본 page_view로는 잡히지 않는다. 화면 이동마다 page_view를 직접 보낸다.
const ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim()
import { readMinutes } from './format.js'

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

// 관리자 브라우저의 전송을 막는다. GA에서 내부 트래픽 필터(traffic_type=internal)를 켠 뒤에는 false 로 바꿔도 된다.
// 막는 동안에도 traffic_type=internal 은 붙여 두어서, 전환할 때 코드를 더 고칠 필요가 없다.
const BLOCK_OWNER = true

let started = false
export function initAnalytics() {
  if (!gaEnabled || started) return
  started = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  if (BLOCK_OWNER && isOwner()) window[`ga-disable-${ID}`] = true
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`
  document.head.appendChild(s)
  window.gtag('js', new Date())
  // 관리자(운영자) 방문은 traffic_type=internal 을 붙여 GA에서 구분, 제외할 수 있게 한다.
  window.gtag('config', ID, isOwner() ? { send_page_view: false, traffic_type: 'internal' } : { send_page_view: false })
}

// 관리자 로그인을 확인하면 이후 이벤트에 traffic_type=internal 을 붙이고, 이 브라우저에 표시를 남긴다.
export function markOwner() {
  if (!gaEnabled) return
  try {
    localStorage.setItem(OWNER_KEY, '1')
  } catch {
    /* 무시 */
  }
  if (BLOCK_OWNER) window[`ga-disable-${ID}`] = true
  if (window.gtag) window.gtag('set', { traffic_type: 'internal' })
}

// 글 관련 이벤트 공통 매개변수. 글 길이와 발행일을 함께 보내 글끼리 공정하게 비교한다.
export function postParams(post) {
  return {
    post_id: post.id,
    post_title: post.title,
    post_category: post.category,
    post_published: post.createdAt ? String(post.createdAt).slice(0, 10) : undefined,
    read_minutes: readMinutes(post.body),
  }
}

// 공유 링크로 들어온 방문을 GA가 소스/매체로 구분하도록, 주소의 utm_ 매개변수만 page_location 에 남긴다.
function utmSearch() {
  const out = new URLSearchParams()
  new URLSearchParams(window.location.search).forEach((v, k) => {
    if (k.startsWith('utm_')) out.set(k, v)
  })
  const q = out.toString()
  return q ? `?${q}` : ''
}

// path: 앱 안의 경로(예: /post/abc). extra: 추가 매개변수(post_id 등)
export function pageView(path, title, extra = {}) {
  if (!gaEnabled || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: `${window.location.origin}${BASE}${path}${utmSearch()}`,
    ...extra,
  })
}

// 글을 골랐을 때. click_location: home_card, home_toc, list_index, next_article
export function selectArticle(post, clickLocation) {
  // 임시저장, 비공개 글(관리자만 보임)의 제목은 분석 데이터로 보내지 않는다.
  if (post.status !== 'published' || post.visibility === 'private') return
  track('article_select', { ...postParams(post), click_location: clickLocation })
}

// 카테고리를 골랐을 때. click_location: home_hero, list_filter, post_meta
export function categoryClick(category, clickLocation) {
  track('category_click', { category: category ?? '전체', click_location: clickLocation })
}

export function track(name, params = {}) {
  if (!gaEnabled || !window.gtag) return
  window.gtag('event', name, params)
}

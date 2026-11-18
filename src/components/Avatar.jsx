import { useState } from 'react'

// DiceBear 아바타 API(notionists-neutral, 라이선스 CC0 1.0이라 출처 표기가 필요 없다).
// 같은 seed는 항상 같은 얼굴이 나온다. 색은 회색 계열 세 가지 중 seed에 따라 하나가 정해져서 모노톤이다.
// 방문자가 어느 주소에서 왔는지 보내지 않도록 referrer 는 끈다.
const BASE = 'https://api.dicebear.com/10.x/notionists-neutral/svg'
export const avatarUrl = (seed) => `${BASE}?seed=${encodeURIComponent(seed)}&backgroundColor=e8e8e8,dcdcdc,f2f2f2`

export default function Avatar({ seed, size = 28 }) {
  const [failed, setFailed] = useState(false)
  // API가 응답하지 않으면 단색 원으로 대신한다.
  if (failed) return <span className="av av-fallback" style={{ width: size, height: size }} aria-hidden="true" />
  return <img className="av" src={avatarUrl(seed)} width={size} height={size} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
}

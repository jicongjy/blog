// 발행 전 점검(F2, PRD 6.2): 제목, 요약, 카테고리가 비어 있으면 발행하지 않고, 표지가 비어 있으면 알리기만 한다.
// 임시저장에는 쓰지 않는다.
export function checkBeforePublish({ title, excerpt, category, thumbnail }) {
  const blocking = []
  if (!String(title ?? '').trim()) blocking.push('제목')
  if (!String(excerpt ?? '').trim()) blocking.push('요약')
  if (!String(category ?? '').trim()) blocking.push('카테고리')
  const warnings = []
  if (!String(thumbnail ?? '').trim()) warnings.push('표지')
  return { blocking, warnings }
}

// 카테고리별 대표 이미지. 이름(한글, 영문)이나 순서로 찾아서, 이름을 바꿔도 이미지가 이어진다.
const base = import.meta.env.BASE_URL
const img = (f) => `${base}images/${f}`

const BY_NAME = {
  기획: 'plan.jpg',
  planning: 'plan.jpg',
  plan: 'plan.jpg',
  설계: 'design.jpg',
  design: 'design.jpg',
  운영: 'ops.jpg',
  operations: 'ops.jpg',
  operation: 'ops.jpg',
}
const BY_ORDER = ['plan.jpg', 'design.jpg', 'ops.jpg']

export const heroImage = img('hero.jpg')

// name: 카테고리 이름, index: 카테고리 목록에서의 순서(0부터). 없으면 null.
export function categoryImage(name = '', index = -1) {
  const f = BY_NAME[name.trim().toLowerCase()] ?? BY_ORDER[index]
  return f ? img(f) : null
}

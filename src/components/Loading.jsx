// 글을 기다리는 동안 보이는 작은 원 하나. 빨리 끝나면 보이지 않도록 0.25초 뒤에 나타난다.
export default function Loading() {
  return (
    <div className="ld" role="status" aria-label="불러오는 중">
      <span className="ld-dot" />
    </div>
  )
}

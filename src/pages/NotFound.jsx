// 없는 주소에서 보이는 화면. 다른 사이트와 같은 404 화면(public/not-found.html)을 그대로 보여 준다.
export default function NotFound() {
  return (
    <iframe
      title="404 페이지를 찾을 수 없어요"
      src={`${import.meta.env.BASE_URL}not-found.html`}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#fff' }}
    />
  )
}

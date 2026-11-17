import { safeHtml } from '../lib/body.js'

// html을 직접 받으면 그대로(이미 걸러진 값), 아니면 source를 걸러서 그린다.
export default function Body({ source = '', html }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html ?? safeHtml(source) }} />
}

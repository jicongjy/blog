import { safeHtml } from '../lib/body.js'

export default function Body({ source = '' }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: safeHtml(source) }} />
}

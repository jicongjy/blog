import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const tools = [
  { label: '제목', run: (c) => c.toggleHeading({ level: 2 }), active: (e) => e.isActive('heading', { level: 2 }) },
  { label: '소제목', run: (c) => c.toggleHeading({ level: 3 }), active: (e) => e.isActive('heading', { level: 3 }) },
  { label: '굵게', run: (c) => c.toggleBold(), active: (e) => e.isActive('bold') },
  { label: '기울임', run: (c) => c.toggleItalic(), active: (e) => e.isActive('italic') },
  { label: '목록', run: (c) => c.toggleBulletList(), active: (e) => e.isActive('bulletList') },
  { label: '번호', run: (c) => c.toggleOrderedList(), active: (e) => e.isActive('orderedList') },
  { label: '인용', run: (c) => c.toggleBlockquote(), active: (e) => e.isActive('blockquote') },
]

export default function RichEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }),
      Placeholder.configure({ placeholder: '내용을 입력하세요.' }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  })

  // 툴바의 활성 표시를 갱신한다.
  useEditorState({ editor, selector: (s) => s.editor?.state.selection })

  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('링크 주소 (비우면 링크 해제)', prev)
    if (url === null) return
    if (url.trim() === '') return editor.chain().focus().unsetLink().run()
    if (!/^(https?:|mailto:)/i.test(url.trim())) return window.alert('https:// 로 시작하는 주소를 입력해 주세요.')
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div className="rte">
      <div className="rte-bar" role="toolbar" aria-label="서식">
        {tools.map((t) => (
          <button key={t.label} type="button" className={t.active(editor) ? 'on' : ''} onClick={() => t.run(editor.chain().focus()).run()}>
            {t.label}
          </button>
        ))}
        <button type="button" className={editor.isActive('link') ? 'on' : ''} onClick={setLink}>
          링크
        </button>
        <span className="sp" />
        <button type="button" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          되돌리기
        </button>
      </div>
      <EditorContent editor={editor} className="rte-body art sm" />
    </div>
  )
}

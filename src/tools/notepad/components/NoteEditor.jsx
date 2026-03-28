import { useEffect, useRef } from 'react'
import styles from '../notepad.module.scss'
import Toolbar from './Toolbar'
import { useEditorStats } from '../hooks/useEditorStats'

export default function NoteEditor({ note, onUpdate, onHome, onBack }) {
    const editorRef = useRef()

    const { words, chars } = useEditorStats(note?.body || '')

    // Sync content when note changes
    useEffect(() => {
        if (!editorRef.current) return
        if (editorRef.current.innerHTML !== (note?.body || '')) {
            editorRef.current.innerHTML = note?.body || ''
        }
    }, [note?.id])

    const handleInput = () => {
        if (!note) return
        onUpdate(note.id, { body: editorRef.current.innerHTML })
    }

    const handleDownload = (type) => {
        if (!note) return
        const text = editorRef.current.innerText
        const content = type === 'md'
            ? `# ${note.title}\n\n${text}`
            : `${note.title}\n\n${text}`
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${note.title || 'note'}.${type}`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!note) return (
        <div className={styles.emptyEditor}>
            <span>Select a note or create a new one</span>
        </div>
    )

    return (
        <div className={styles.editorWrap}>
            <Toolbar onDownload={handleDownload} onHome={onHome} onBack={onBack} />


            <div className={styles.editor}>
                <input
                    className={styles.titleInput}
                    value={note.title}
                    placeholder="Untitled"
                    onChange={e => onUpdate(note.id, { title: e.target.value })}
                />
                <div
                    ref={editorRef}
                    className={styles.bodyInput}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    data-placeholder="Start writing..."
                />
            </div>

            <div className={styles.statusBar}>
                <span>{words} words</span>
                <span>{chars} characters</span>
                <span style={{ color: 'var(--accent)' }}>● saved</span>
            </div>
        </div>
    )
}
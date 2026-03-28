import { useEffect, useRef } from 'react'
import styles from '../notepad.module.scss'
import Toolbar from './Toolbar'
import { useEditorStats } from '../hooks/useEditorStats'

/**
 * NoteEditor Component
 * 
 * The main editing area for a note. Uses contentEditable for rich text support.
 * 
 * @param {Object} props
 * @param {Object} props.note - The currently active note object
 * @param {Function} props.onUpdate - Callback to save note changes
 * @param {Function} props.onHome - Callback to navigate home
 * @param {Function} props.onBack - Callback to return to the note list (mobile)
 */
export default function NoteEditor({ note, onUpdate, onHome, onBack }) {
    const editorRef = useRef()
    
    // Hook to calculate word and character counts from the note body
    const { words, chars } = useEditorStats(note?.body || '')

    /**
     * Synchronize editor content when the active note changes.
     * We use innerHTML to support rich text formatting.
     */
    useEffect(() => {
        if (!editorRef.current) return
        if (editorRef.current.innerHTML !== (note?.body || '')) {
            editorRef.current.innerHTML = note?.body || ''
        }
    }, [note?.id])

    /**
     * Handle user input in the editor area.
     * Propagates changes to the parent state for persistence.
     */
    const handleInput = () => {
        if (!note) return
        onUpdate(note.id, { body: editorRef.current.innerHTML })
    }

    /**
     * Export the current note content to a file.
     * Supports .txt and .md formats.
     * 
     * @param {string} type - 'txt' or 'md'
     */
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

    // Empty state when no note is selected
    if (!note) return (
        <div className={styles.emptyEditor}>
            <span>Select a note or create a new one</span>
        </div>
    )

    return (
        <div className={styles.editorWrap}>
            {/* Integrated Toolbar for formatting and actions */}
            <Toolbar onDownload={handleDownload} onHome={onHome} onBack={onBack} />

            <div className={styles.editor}>
                {/* Note Title Input */}
                <input
                    className={styles.titleInput}
                    value={note.title}
                    placeholder="Untitled"
                    onChange={e => onUpdate(note.id, { title: e.target.value })}
                />
                
                {/* Rich Text Editor Surface */}
                <div
                    ref={editorRef}
                    className={styles.bodyInput}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    data-placeholder="Start writing..."
                />
            </div>

            {/* Live Stats Bar */}
            <div className={styles.statusBar}>
                <span>{words} words</span>
                <span>{chars} characters</span>
                <span style={{ color: 'var(--accent)' }}>● saved</span>
            </div>
        </div>
    )
}
import { useEffect, useRef } from 'react'
import styles from '../notepad.module.scss'

export default function NoteEditor({ note, onUpdate }) {
    const titleRef = useRef()

    useEffect(() => {
        if (note) titleRef.current?.focus()
    }, [note?.id])

    if (!note) return (
        <div className={styles.emptyEditor}>
            <span>Select a note or create a new one</span>
        </div>
    )

    return (
        <div className={styles.editor}>
            <input
                ref={titleRef}
                className={styles.titleInput}
                value={note.title}
                placeholder="Untitled"
                onChange={e => onUpdate(note.id, { title: e.target.value })}
            />
            <textarea
                className={styles.bodyInput}
                value={note.body}
                placeholder="Start writing..."
                onChange={e => onUpdate(note.id, { body: e.target.value })}
            />
        </div>
    )
}
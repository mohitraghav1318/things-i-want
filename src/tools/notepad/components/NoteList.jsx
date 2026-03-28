import styles from '../notepad.module.scss'

export default function NoteList({ notes, activeId, onSelect, onCreate, onDelete }) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>Notes</span>
                <button className={styles.newBtn} onClick={onCreate}>+</button>
            </div>

            <div className={styles.noteList}>
                {notes.length === 0 && (
                    <p className={styles.empty}>No notes yet.<br />Hit + to create one.</p>
                )}
                {notes.map(note => (
                    <div
                        key={note.id}
                        className={`${styles.noteItem} ${note.id === activeId ? styles.active : ''}`}
                        onClick={() => onSelect(note.id)}
                    >
                        <span className={styles.noteTitle}>
                            {note.title || 'Untitled'}
                        </span>
                        <span className={styles.noteSnippet}>
                            {note.body?.slice(0, 50) || 'Empty note'}
                        </span>
                        <button
                            className={styles.deleteBtn}
                            onClick={e => { e.stopPropagation(); onDelete(note.id) }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    )
}
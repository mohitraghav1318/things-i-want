import styles from '../notepad.module.scss'

export default function NoteList({ notes, activeId, onSelect, onCreate, onDelete, onPin, search, onSearch }) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>Notes</span>
                <div className={styles.sidebarActions}>
                    <button 
                        className={styles.mobileCollapse} 
                        onClick={() => notes[0] && onSelect(activeId || notes[0].id)}
                        title="Hide List"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button className={styles.newBtn} onClick={onCreate}>+</button>
                </div>
            </div>


            <div className={styles.searchWrap}>
                <input
                    className={styles.searchInput}
                    placeholder="Search notes..."
                    value={search}
                    onChange={e => onSearch(e.target.value)}
                />
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
                        <div className={styles.noteItemTop}>
                            <span className={styles.noteTitle}>
                                {note.pinned && <span className={styles.pinDot}>📌 </span>}
                                {note.title || 'Untitled'}
                            </span>
                            <div className={styles.noteActions}>
                                <button
                                    className={`${styles.actionBtn} ${note.pinned ? styles.pinned : ''}`}
                                    onClick={e => { e.stopPropagation(); onPin(note.id) }}
                                    title="Pin"
                                >⊕</button>
                                <button
                                    className={styles.actionBtn}
                                    onClick={e => { e.stopPropagation(); onDelete(note.id) }}
                                    title="Delete"
                                >×</button>
                            </div>
                        </div>
                        <span className={styles.noteSnippet}>
                            {note.body?.replace(/<[^>]*>/g, '').slice(0, 55) || 'Empty note'}
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    )
}
import styles from '../notepad.module.scss'

/**
 * NoteList Component (Sidebar)
 * 
 * Lists all existing notes with search, creation, and deletion functionality.
 * Handle adaptive visibility on mobile devices.
 */
export default function NoteList({ notes, activeId, onSelect, onCreate, onDelete, onPin, search, onSearch }) {
    return (
        <aside className={styles.sidebar}>
            {/* Header with Title and Global Actions */}
            <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>Notes</span>
                <div className={styles.sidebarActions}>
                    {/* Mobile-only toggle to hide the sidebar and show the editor */}
                    <button 
                        className={styles.mobileCollapse} 
                        onClick={() => notes[0] && onSelect(activeId || notes[0].id)}
                        title="Hide List"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    {/* Create New Note Button */}
                    <button className={styles.newBtn} onClick={onCreate}>+</button>
                </div>
            </div>

            {/* Search Input Area */}
            <div className={styles.searchWrap}>
                <input
                    className={styles.searchInput}
                    placeholder="Search notes..."
                    value={search}
                    onChange={e => onSearch(e.target.value)}
                />
            </div>

            {/* Scrollable list of notes */}
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
                        {/* Note Item Header (Title + Actions) */}
                        <div className={styles.noteItemTop}>
                            <span className={styles.noteTitle}>
                                {note.pinned && <span className={styles.pinDot}>📌 </span>}
                                {note.title || 'Untitled'}
                            </span>
                            <div className={styles.noteActions}>
                                {/* Pin Action */}
                                <button
                                    className={`${styles.actionBtn} ${note.pinned ? styles.pinned : ''}`}
                                    onClick={e => { e.stopPropagation(); onPin(note.id) }}
                                    title="Pin"
                                >⊕</button>
                                {/* Delete Action */}
                                <button
                                    className={styles.actionBtn}
                                    onClick={e => { e.stopPropagation(); onDelete(note.id) }}
                                    title="Delete"
                                >×</button>
                            </div>
                        </div>
                        {/* Short snippet of the note content (HTML stripped) */}
                        <span className={styles.noteSnippet}>
                            {note.body?.replace(/<[^>]*>/g, '').slice(0, 55) || 'Empty note'}
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    )
}
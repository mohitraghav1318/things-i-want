import styles from '../draw.module.scss'

/**
 * DrawingList Component (Sidebar)
 * 
 * Displays a list of saved sketches with search and creation functionality.
 */
export default function DrawingList({ drawings, activeId, onSelect, onCreate, onDelete, search, onSearch }) {
    return (
        <aside className={styles.sidebar}>
            {/* Header */}
            <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>Sketches</span>
                <div className={styles.sidebarActions}>
                    {/* Mobile Collapse Toggle (matches Notepad behavior) */}
                    <button 
                        className={styles.mobileCollapse} 
                        onClick={() => drawings[0] && onSelect(activeId || drawings[0].id)}
                        title="Hide List"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button className={styles.newBtn} onClick={onCreate} title="New Sketch">+</button>
                </div>
            </div>

            {/* Search */}
            <div className={styles.searchWrap}>
                <input
                    className={styles.searchInput}
                    placeholder="Search sketches..."
                    value={search}
                    onChange={e => onSearch(e.target.value)}
                />
            </div>

            {/* List */}
            <div className={styles.drawList}>
                {drawings.length === 0 && (
                    <p className={styles.empty}>No sketches found.<br />Start a new one!</p>
                )}
                {drawings.map(draw => (
                    <div
                        key={draw.id}
                        className={`${styles.drawItem} ${draw.id === activeId ? styles.active : ''}`}
                        onClick={() => onSelect(draw.id)}
                    >
                        <div className={styles.drawItemTop}>
                            <span className={styles.drawTitle}>
                                {draw.title || 'Untitled'}
                            </span>
                            <div className={styles.drawActions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={e => { e.stopPropagation(); onDelete(draw.id) }}
                                    title="Delete"
                                >×</button>
                            </div>
                        </div>
                        <span className={styles.drawTimestamp}>
                            {new Date(draw.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    )
}

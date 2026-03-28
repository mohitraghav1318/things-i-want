import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotes } from './hooks/useNotes'
import NoteList from './components/NoteList'
import NoteEditor from './components/NoteEditor'
import styles from './notepad.module.scss'

export default function Notepad() {
    const navigate = useNavigate()
    const { notes, createNote, updateNote, deleteNote } = useNotes()
    const [activeId, setActiveId] = useState(notes[0]?.id || null)

    const activeNote = notes.find(n => n.id === activeId) || null

    const handleCreate = () => {
        const id = createNote()
        setActiveId(id)
    }

    const handleDelete = (id) => {
        deleteNote(id)
        if (activeId === id) setActiveId(notes.find(n => n.id !== id)?.id || null)
    }

    return (
        <div className={styles.wrapper}>
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'fixed', top: '1.25rem', left: '1.25rem',
                    background: 'none', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem', padding: '4px 10px', borderRadius: '4px',
                    cursor: 'pointer', zIndex: 10, letterSpacing: '0.05em'
                }}
            >
                ← home
            </button>

            <NoteList
                notes={notes}
                activeId={activeId}
                onSelect={setActiveId}
                onCreate={handleCreate}
                onDelete={handleDelete}
            />
            <NoteEditor note={activeNote} onUpdate={updateNote} />
        </div>
    )
}
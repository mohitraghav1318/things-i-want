import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotes } from './hooks/useNotes'
import NoteList from './components/NoteList'
import NoteEditor from './components/NoteEditor'
import styles from './notepad.module.scss'

export default function Notepad() {
    const navigate = useNavigate()
    const { notes, createNote, updateNote, deleteNote, togglePin } = useNotes()
    const [activeId, setActiveId] = useState(notes[0]?.id || null)
    const [search, setSearch] = useState('')

    const activeNote = notes.find(n => n.id === activeId) || null

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.body?.replace(/<[^>]*>/g, '').toLowerCase().includes(search.toLowerCase())
    )

    const handleCreate = () => {
        const id = createNote()
        setActiveId(id)
        setSearch('')
    }

    const handleDelete = (id) => {
        deleteNote(id)
        if (activeId === id) {
            setActiveId(notes.find(n => n.id !== id)?.id || null)
        }
    }

    return (
        <div className={styles.wrapper}>


            <NoteList
                notes={filteredNotes}
                activeId={activeId}
                onSelect={setActiveId}
                onCreate={handleCreate}
                onDelete={handleDelete}
                onPin={togglePin}
                search={search}
                onSearch={setSearch}
            />

            <NoteEditor note={activeNote} onUpdate={updateNote} onHome={() => navigate('/')} />
        </div>
    )
}
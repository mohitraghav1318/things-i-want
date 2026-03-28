import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotes } from './hooks/useNotes'
import NoteList from './components/NoteList'
import NoteEditor from './components/NoteEditor'
import styles from './notepad.module.scss'

/**
 * Notepad Main Component
 * 
 * Manages the state of notes, search, and the currently active note.
 * Handles the high-level layout and navigation.
 */
export default function Notepad() {
    const navigate = useNavigate()
    
    // Custom hook for note CRUD operations and persistence
    const { notes, createNote, updateNote, deleteNote, togglePin } = useNotes()
    
    // Track the currently selected note ID
    // On mobile, we start with no note selected (null) to show the list first
    const [activeId, setActiveId] = useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) return null
        return notes[0]?.id || null
    })
    
    // Search query state
    const [search, setSearch] = useState('')

    // Derive the active note object from the list
    const activeNote = notes.find(n => n.id === activeId) || null

    // Filter notes based on the search query (title or body)
    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.body?.replace(/<[^>]*>/g, '').toLowerCase().includes(search.toLowerCase())
    )

    /**
     * Create a new note and immediately select it
     */
    const handleCreate = () => {
        const id = createNote()
        setActiveId(id)
        setSearch('')
    }

    /**
     * Delete a note and handle focus transition if the active note was deleted
     */
    const handleDelete = (id) => {
        deleteNote(id)
        if (activeId === id) {
            // Select the next available note or null
            setActiveId(notes.find(n => n.id !== id)?.id || null)
        }
    }

    return (
        /* The data-view attribute controls the responsive visibility in SCSS */
        <div className={styles.wrapper} data-view={activeId ? 'editor' : 'list'}>

            {/* Sidebar with Note List and Search */}
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

            {/* Main Editing Surface */}
            <NoteEditor 
                note={activeNote} 
                onUpdate={updateNote} 
                onHome={() => navigate('/')} 
                onBack={() => setActiveId(null)}
            />

        </div>
    )
}
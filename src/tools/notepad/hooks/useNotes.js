import { useState, useEffect } from 'react'

const STORAGE_KEY = 'tiw_notes'

function getId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useNotes() {
    const [notes, setNotes] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch { return [] }
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    }, [notes])

    const createNote = () => {
        const note = {
            id: getId(),
            title: 'Untitled',
            body: '',
            pinned: false,
            createdAt: Date.now(),
        }
        setNotes(prev => [note, ...prev])
        return note.id
    }

    const updateNote = (id, changes) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...changes } : n))
    }

    const deleteNote = (id) => {
        setNotes(prev => prev.filter(n => n.id !== id))
    }

    const togglePin = (id) => {
        setNotes(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
            return [
                ...updated.filter(n => n.pinned),
                ...updated.filter(n => !n.pinned),
            ]
        })
    }

    return { notes, createNote, updateNote, deleteNote, togglePin }
}
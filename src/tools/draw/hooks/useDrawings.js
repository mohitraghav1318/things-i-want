import { useState, useEffect } from 'react'

const STORAGE_KEY = 'tiw_drawings'

/**
 * Generate a unique ID for sketches
 */
function getId() {
    return 'sketch_' + Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * useDrawings Hook
 * 
 * Manages the persistence of drawings (metadata and dataURLs) in localStorage.
 */
export function useDrawings() {
    const [drawings, setDrawings] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch { return [] }
    })

    // Persist to localStorage whenever drawings change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings))
    }, [drawings])

    /**
     * Create a new empty sketch
     */
    const createDrawing = () => {
        const drawing = {
            id: getId(),
            title: 'Untitled Sketch',
            dataURL: null,
            elements: [], // Vector data
            backgroundColor: null, // Custom background
            createdAt: Date.now(),
        }
        setDrawings(prev => [drawing, ...prev])
        return drawing.id
    }

    /**
     * Update an existing sketch (title or data)
     */
    const updateDrawing = (id, changes) => {
        setDrawings(prev => prev.map(d => d.id === id ? { ...d, ...changes } : d))
    }

    /**
     * Remove a sketch from the list
     */
    const deleteDrawing = (id) => {
        setDrawings(prev => prev.filter(d => d.id !== id))
    }

    return { drawings, createDrawing, updateDrawing, deleteDrawing }
}

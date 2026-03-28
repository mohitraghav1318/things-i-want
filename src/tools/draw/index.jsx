import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDrawings } from './hooks/useDrawings'
import DrawingList from './components/DrawingList'
import Canvas from './components/Canvas'
import DrawToolbar from './components/DrawToolbar'
import styles from './draw.module.scss'

/**
 * Draw Tool Main Component
 */
export default function Draw() {
    const navigate = useNavigate()
    const { drawings, createDrawing, updateDrawing, deleteDrawing } = useDrawings()
    
    // UI state
    const [activeId, setActiveId] = useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) return null
        return drawings[0]?.id || null
    })
    const [search, setSearch] = useState('')
    const [pendingImage, setPendingImage] = useState(null)
    
    // Tool settings
    const [tool, setTool] = useState('pen')
    const [color, setColor] = useState('#00ff88')
    const [thickness, setThickness] = useState(5)
    const [zoom, setZoom] = useState(1)

    // Refs
    const canvasRef = useRef(null)
    const canvasCompRef = useRef(null)

    // Selection logic
    const activeDrawing = drawings.find(d => d.id === activeId) || null
    const filteredDrawings = drawings.filter(d => 
        d.title.toLowerCase().includes(search.toLowerCase())
    )

    /**
     * Keyboard Shortcuts
     */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!activeId) return
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault()
                    canvasCompRef.current?.undo()
                } else if (e.key === 'y') {
                    e.preventDefault()
                    canvasCompRef.current?.redo()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeId])

    const handleCreate = () => {
        const id = createDrawing()
        setActiveId(id)
    }

    const handleDelete = (id) => {
        deleteDrawing(id)
        if (activeId === id) {
            setActiveId(drawings.find(d => d.id !== id)?.id || null)
        }
    }

    const handleFileUpload = (file) => {
        if (!activeDrawing) return
        const reader = new FileReader()
        reader.onload = (e) => {
            setPendingImage(e.target.result)
        }
        reader.readAsDataURL(file)
    }

    const handleBake = (finalDataURL) => {
        updateDrawing(activeId, { dataURL: finalDataURL })
        setPendingImage(null)
    }

    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    // Poll for stack state
    useEffect(() => {
        const interval = setInterval(() => {
            if (canvasCompRef.current) {
                setCanUndo(canvasCompRef.current.canUndo)
                setCanRedo(canvasCompRef.current.canRedo)
            }
        }, 300)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className={styles.wrapper} data-view={activeId ? 'editor' : 'list'}>
            
            <DrawingList
                drawings={filteredDrawings}
                activeId={activeId}
                onSelect={id => { setActiveId(id); setPendingImage(null); }}
                onCreate={handleCreate}
                onDelete={handleDelete}
                search={search}
                onSearch={setSearch}
            />

            <div className={styles.canvasWrap}>
                <DrawToolbar 
                    activeDrawing={activeDrawing}
                    updateDrawing={updateDrawing}
                    activeTool={tool}
                    onToolChange={(t) => {
                        if (t === 'clear') {
                            updateDrawing(activeId, { elements: [], dataURL: null })
                        } else {
                            setTool(t)
                        }
                    }}
                    color={color}
                    onColorChange={setColor}
                    thickness={thickness}
                    onThicknessChange={setThickness}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    onFileUpload={handleFileUpload}
                    onHome={() => navigate('/')}
                    onBack={() => setActiveId(null)}
                    canvasRef={canvasRef}
                    onUndo={() => canvasCompRef.current?.undo()}
                    onRedo={() => canvasCompRef.current?.redo()}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />

                {activeDrawing ? (
                    <>
                        <div style={{ padding: '0.5rem 2rem 0', background: 'var(--surface)' }}>
                            <input
                                className={styles.titleInput}
                                value={activeDrawing.title}
                                placeholder="Untitled Sketch"
                                onChange={e => updateDrawing(activeId, { title: e.target.value })}
                                style={{ fontSize: '1.2rem', padding: '10px 0' }}
                            />
                        </div>
                        
                        <Canvas 
                            ref={canvasCompRef}
                            drawing={activeDrawing}
                            tool={tool}
                            color={color}
                            thickness={thickness}
                            zoom={zoom}
                            onUpdate={updateDrawing}
                            canvasRef={canvasRef}
                            pendingImage={pendingImage}
                            onBake={handleBake}
                            onCancelImage={() => setPendingImage(null)}
                        />
                    </>
                ) : (
                    <div className={styles.empty}>
                        Select a sketch to start drawing
                    </div>
                )}

                <div className={styles.statusBar}>
                    <span>Dimensions: 3000x3000px</span>
                    <span>Zoom: {Math.round(zoom * 100)}%</span>
                    <span style={{ color: 'var(--accent)' }}>● Auto-saved</span>
                </div>
            </div>
        </div>
    )
}
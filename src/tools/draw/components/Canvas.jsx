import { useRef, useEffect, useState, useImperativeHandle, forwardRef, useMemo } from 'react'
import styles from '../draw.module.scss'
import { useTheme } from '../../../shared/hooks/useTheme'

/**
 * Canvas Component (Object-Based)
 */
const Canvas = forwardRef(({ 
    drawing, 
    tool, 
    color, 
    thickness, 
    zoom, 
    onUpdate,
    canvasRef,
    pendingImage,
    onBake,
    onCancelImage
}, ref) => {
    const { theme } = useTheme()
    const containerRef = useRef(null)
    const contextRef = useRef(null)
    
    // Core state
    const [elements, setElements] = useState(drawing?.elements || [])
    const [selectedElementId, setSelectedElementId] = useState(null)
    
    // Interaction state
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentElement, setCurrentElement] = useState(null)

    // Panning
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

    // Text state
    const [editingText, setEditingText] = useState(null)

    const CANVAS_WIDTH = 3000
    const CANVAS_HEIGHT = 3000

    const [history, setHistory] = useState([])
    const [redoStack, setRedoStack] = useState([])

    useImperativeHandle(ref, () => ({
        undo: handleUndo,
        redo: handleRedo,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0
    }))

    // Sync from props
    useEffect(() => {
        if (drawing?.elements) setElements(drawing.elements)
    }, [drawing?.id])

    // Update selected element property when tool settings change (color/thickness)
    useEffect(() => {
        if (selectedElementId && !isDrawing && !editingText) {
            setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, color, thickness } : el))
        }
    }, [color, thickness])

    /**
     * Renderer
     */
    const drawAll = (overrideElements = elements) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        contextRef.current = ctx
        
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        ctx.fillStyle = drawing?.backgroundColor || (theme === 'dark' ? '#1a1a1a' : '#ffffff')
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        overrideElements.forEach(el => drawElement(ctx, el))
        if (currentElement) drawElement(ctx, currentElement)
        
        const selected = overrideElements.find(e => e.id === selectedElementId)
        if (selected && !editingText) drawSelectionOutline(ctx, selected)
    }

    const drawElement = (ctx, el) => {
        ctx.beginPath()
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.strokeStyle = el.color; ctx.lineWidth = el.thickness; ctx.globalCompositeOperation = 'source-over'

        if (el.type === 'path') {
            if (el.points.length < 2) return
            ctx.moveTo(el.points[0].x, el.points[0].y)
            el.points.forEach(p => ctx.lineTo(p.x, p.y))
            ctx.stroke()
        } else if (el.type === 'rect') {
            ctx.strokeRect(el.x, el.y, el.w, el.h)
        } else if (el.type === 'circle') {
            ctx.arc(el.x, el.y, el.r, 0, Math.PI * 2); ctx.stroke()
        } else if (el.type === 'line' || el.type === 'arrow') {
            ctx.moveTo(el.x1, el.y1); ctx.lineTo(el.x2, el.y2); ctx.stroke()
            if (el.type === 'arrow') {
                const angle = Math.atan2(el.y2 - el.y1, el.x2 - el.x1); const headlen = 10 * (el.thickness / 2)
                ctx.moveTo(el.x2, el.y2); ctx.lineTo(el.x2 - headlen * Math.cos(angle - Math.PI/6), el.y2 - headlen * Math.sin(angle - Math.PI/6))
                ctx.moveTo(el.x2, el.y2); ctx.lineTo(el.x2 - headlen * Math.cos(angle + Math.PI/6), el.y2 - headlen * Math.sin(angle + Math.PI/6))
                ctx.stroke()
            }
        } else if (el.type === 'text') {
            ctx.font = `${el.thickness * 16}px var(--font-mono)`; ctx.fillStyle = el.color; ctx.textBaseline = 'top'
            ctx.fillText(el.value, el.x, el.y)
        } else if (el.type === 'image') {
            const img = new Image(); img.src = el.dataURL
            if (img.complete) ctx.drawImage(img, el.x, el.y, el.w, el.h)
            else img.onload = () => drawAll()
        }
    }

    const getElementBounds = (el) => {
        if (!el) return { x: 0, y: 0, w: 0, h: 0 }
        if (el.type === 'path') {
            const xs = el.points.map(p => p.x); const ys = el.points.map(p => p.y)
            return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
        } else if (el.type === 'circle') {
            return { x: el.x - el.r, y: el.y - el.r, w: el.r * 2, h: el.r * 2 }
        } else if (el.type === 'line' || el.type === 'arrow') {
            return { x: Math.min(el.x1, el.x2), y: Math.min(el.y1, el.y2), w: Math.max(el.x1, el.x2) - Math.min(el.x1, el.x2), h: Math.max(el.y1, el.y2) - Math.min(el.y1, el.y2) }
        } else if (el.type === 'text') {
            if (!contextRef.current) return { x: el.x, y: el.y, w: 100, h: el.thickness * 16 }
            contextRef.current.font = `${el.thickness * 16}px var(--font-mono)`
            return { x: el.x, y: el.y, w: contextRef.current.measureText(el.value).width, h: el.thickness * 16 }
        }
        return { x: el.x, y: el.y, w: el.w, h: el.h }
    }

    const drawSelectionOutline = (ctx, el) => {
        const bounds = getElementBounds(el)
        const pad = 8 / zoom
        ctx.strokeStyle = '#00c9ff'; ctx.lineWidth = 1 / zoom; ctx.setLineDash([5, 5])
        ctx.strokeRect(bounds.x - pad, bounds.y - pad, bounds.w + pad*2, bounds.h + pad*2)
        ctx.setLineDash([])
        ctx.fillStyle = '#00c9ff'; const s = 10 / zoom
        ctx.fillRect(bounds.x + bounds.w + pad - s/2, bounds.y + bounds.h + pad - s/2, s, s) 
    }

    useMemo(() => drawAll(), [elements, currentElement, selectedElementId, theme, drawing?.backgroundColor, zoom, editingText])

    const saveHistory = (newElements) => {
        setHistory(prev => [...prev.slice(-14), elements])
        setRedoStack([])
        onUpdate(drawing.id, { elements: newElements, dataURL: canvasRef.current.toDataURL('image/png', 0.2) })
    }

    const handleUndo = () => {
        if (history.length === 0) return
        setRedoStack(p => [...p, elements]); const prev = history[history.length - 1]
        setElements(prev); setHistory(p => p.slice(0, -1))
        onUpdate(drawing.id, { elements: prev })
    }

    const handleRedo = () => {
        if (redoStack.length === 0) return
        setHistory(p => [...p, elements]); const next = redoStack[redoStack.length - 1]
        setElements(next); setRedoStack(p => p.slice(0, -1))
        onUpdate(drawing.id, { elements: next })
    }

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()
        return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom }
    }

    const hitTest = (x, y) => {
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i]; const b = getElementBounds(el)
            const pad = 15 / zoom
            if (x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad) return el.id
        }
        return null
    }

    const handleMouseDown = (e) => {
        if (editingText) return // Don't interrupt typing
        const { x, y } = getPos(e)
        
        if (tool === 'hand') {
            setIsPanning(true); setPanStart({ x: e.clientX, y: e.clientY, scrollLeft: containerRef.current.scrollLeft, scrollTop: containerRef.current.scrollTop }); return
        }

        if (tool === 'select') {
            const id = hitTest(x, y)
            setSelectedElementId(id)
            if (id) {
                const el = elements.find(e => e.id === id)
                // If it's text, and we click it again or it's already selected, enter edit mode
                if (el.type === 'text') {
                    setEditingText({ ...el })
                    setElements(prev => prev.filter(e => e.id !== id))
                    setSelectedElementId(null)
                    return
                }
                const b = getElementBounds(el); const s = 15 / zoom
                if (Math.hypot(x - (b.x + b.w), y - (b.y + b.h)) < s) setIsResizing(true)
                else setIsDragging(true)
                setDragStart({ x, y })
            }
            return
        }

        if (tool === 'text') {
            setEditingText({ id: 'text_' + Date.now(), type: 'text', x, y, value: '', color, thickness })
            return
        }

        setSelectedElementId(null); setIsDrawing(true)
        const id = 'el_' + Date.now() + Math.random().toString(36).slice(2)
        if (tool === 'pen') setCurrentElement({ id, type: 'path', points: [{x, y}], color, thickness })
        else if (tool === 'rect') setCurrentElement({ id, type: 'rect', x, y, w: 0, h: 0, color, thickness })
        else if (tool === 'circle') setCurrentElement({ id, type: 'circle', x, y, r: 0, color, thickness })
        else if (tool === 'line' || tool === 'arrow') setCurrentElement({ id, type: tool, x1: x, y1: y, x2: x, y2: y, color, thickness })
    }

    const handleMouseMove = (e) => {
        const { x, y } = getPos(e)
        if (isPanning) { containerRef.current.scrollLeft = panStart.scrollLeft - (e.clientX - panStart.x); containerRef.current.scrollTop = panStart.scrollTop - (e.clientY - panStart.y); return }

        if (selectedElementId) {
            const dx = x - dragStart.x; const dy = y - dragStart.y
            if (isDragging) {
                setElements(prev => prev.map(el => {
                    if (el.id !== selectedElementId) return el
                    if (el.type === 'path') return { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) }
                    if (el.type === 'circle') return { ...el, x: el.x + dx, y: el.y + dy }
                    if (el.type === 'line' || el.type === 'arrow') return { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy }
                    return { ...el, x: el.x + dx, y: el.y + dy }
                }))
                setDragStart({ x, y }); return
            }
            if (isResizing) {
                setElements(prev => prev.map(el => {
                    if (el.id !== selectedElementId) return el
                    if (el.type === 'rect' || el.type === 'image') return { ...el, w: Math.max(10, el.w + dx), h: Math.max(10, el.h + dy) }
                    if (el.type === 'circle') return { ...el, r: Math.max(5, el.r + dx) }
                    if (el.type === 'line' || el.type === 'arrow') return { ...el, x2: el.x2 + dx, y2: el.y2 + dy }
                    return el
                }))
                setDragStart({ x, y }); return
            }
        }

        if (!isDrawing || !currentElement) return
        if (currentElement.type === 'path') setCurrentElement(prev => ({ ...prev, points: [...prev.points, {x, y}] }))
        else if (currentElement.type === 'rect') setCurrentElement(prev => ({ ...prev, w: x - prev.x, h: y - prev.y }))
        else if (currentElement.type === 'circle') setCurrentElement(prev => ({ ...prev, r: Math.hypot(x - prev.x, y - prev.y) }))
        else if (currentElement.type === 'line' || currentElement.type === 'arrow') setCurrentElement(prev => ({ ...prev, x2: x, y2: y }))
    }

    const handleMouseUp = () => {
        if (isResizing || isDragging) saveHistory(elements)
        setIsPanning(false); setIsDragging(false); setIsResizing(false)
        if (!isDrawing || !currentElement) return
        setIsDrawing(false)
        const newElements = [...elements, currentElement]
        setElements(newElements); setCurrentElement(null); saveHistory(newElements)
    }

    const bakeText = () => {
        if (!editingText?.value.trim()) { setEditingText(null); return }
        const newElements = [...elements, editingText]
        setElements(newElements); setSelectedElementId(editingText.id); setEditingText(null); saveHistory(newElements)
    }

    useEffect(() => {
        if (pendingImage) {
            const newElements = [...elements, { id: 'img_' + Date.now(), type: 'image', dataURL: pendingImage, x: (containerRef.current.scrollLeft + 200)/zoom, y: (containerRef.current.scrollTop + 200)/zoom, w: 400, h: 400, color: 'none', thickness: 0 }]
            setElements(newElements); saveHistory(newElements); onBake() 
        }
    }, [pendingImage])

    return (
        <div ref={containerRef} className={`${styles.canvasContainer} ${tool === 'hand' ? styles.panning : ''} ${theme === 'dark' ? styles.dark : ''}`}>
            <div style={{ transform: `scale(${zoom})`, position: 'relative' }}>
                <canvas ref={canvasRef} className={styles.mainCanvas} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
                    onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
                
                {editingText && (
                    <textarea 
                        className={styles.textInput} 
                        autoFocus 
                        value={editingText.value}
                        style={{ 
                            left: editingText.x, 
                            top: editingText.y, 
                            color: editingText.color, 
                            fontSize: `${editingText.thickness * 16}px`,
                            minWidth: '150px',
                            minHeight: `${editingText.thickness * 20}px`
                        }}
                        placeholder="Type here..."
                        onChange={e => setEditingText({ ...editingText, value: e.target.value })}
                        onBlur={bakeText} 
                        onMouseDown={e => e.stopPropagation()}
                        onKeyDown={e => { 
                            if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); bakeText(); }
                            if(e.key === 'Escape') { setEditingText(null); }
                        }} 
                    />
                )}
            </div>
        </div>
    )
})

export default Canvas

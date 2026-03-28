import { useState, useRef } from 'react'
import styles from '../draw.module.scss'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useTheme } from '../../../shared/hooks/useTheme'

/**
 * DrawToolbar Component
 */
export default function DrawToolbar({
    activeDrawing,
    updateDrawing,
    activeTool,
    onToolChange,
    color,
    onColorChange,
    thickness,
    onThicknessChange,
    zoom,
    onZoomChange,
    onFileUpload,
    onHome,
    onBack,
    canvasRef,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}) {
    const [isExporting, setIsExporting] = useState(false)
    const { theme, toggle } = useTheme()
    const fileInputRef = useRef(null)

    const handleExportPDF = async () => {
        if (isExporting || !canvasRef?.current) return
        setIsExporting(true)

        try {
            const canvas = await html2canvas(canvasRef.current, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: activeDrawing?.backgroundColor || (theme === 'dark' ? '#1a1a1a' : '#ffffff')
            })
            
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            })

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
            pdf.save(`${activeDrawing?.title || 'sketch'}.pdf`)
        } catch (error) {
            console.error('PDF Export failed:', error)
            alert('PDF Export failed.')
        } finally {
            setIsExporting(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            onFileUpload(file)
            e.target.value = '' 
        }
    }

    return (
        <div className={styles.toolbar}>
            <div className={styles.toolRow}>
                {/* Navigation & History */}
                <button className={styles.mobileBack} onClick={onBack}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>

                <div className={styles.toolGroup}>
                    <button className={styles.toolBtn} onClick={onHome} data-tooltip="Go Home">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </button>
                    <div className={styles.divider} />
                    <button className={styles.toolBtn} onClick={onUndo} disabled={!canUndo} data-tooltip="Undo (Ctrl+Z)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                    </button>
                    <button className={styles.toolBtn} onClick={onRedo} disabled={!canRedo} data-tooltip="Redo (Ctrl+Y)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
                    </button>
                </div>

                {/* Draw Tools */}
                <div className={styles.toolGroup}>
                    <div className={styles.toolLabel}>Tools</div>
                    <button className={`${styles.toolBtn} ${activeTool === 'select' ? styles.active : ''}`} onClick={() => onToolChange('select')} data-tooltip="Select Item (V or S)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
                        <span>Select</span>
                    </button>
                    <button className={`${styles.toolBtn} ${activeTool === 'pen' ? styles.active : ''}`} onClick={() => onToolChange('pen')} data-tooltip="Pen (P)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l5 5"/></svg>
                        <span>Pen</span>
                    </button>
                    <button className={`${styles.toolBtn} ${activeTool === 'eraser' ? styles.active : ''}`} onClick={() => onToolChange('eraser')} data-tooltip="Eraser (E)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
                        <span>Eraser</span>
                    </button>
                    <button className={`${styles.toolBtn} ${activeTool === 'hand' ? styles.active : ''}`} onClick={() => onToolChange('hand')} data-tooltip="Pan (H)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                    </button>
                </div>

                {/* Insert */}
                <div className={styles.toolGroup}>
                    <div className={styles.toolLabel}>Insert</div>
                    <button className={`${styles.toolBtn} ${activeTool === 'rect' ? styles.active : ''}`} onClick={() => onToolChange('rect')} data-tooltip="Rectangle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                    </button>
                    <button className={`${styles.toolBtn} ${activeTool === 'circle' ? styles.active : ''}`} onClick={() => onToolChange('circle')} data-tooltip="Circle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                    </button>
                    <button className={`${styles.toolBtn} ${activeTool === 'line' ? styles.active : ''}`} onClick={() => onToolChange('line')} data-tooltip="Line">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5"/></svg>
                    </button>
                    <button className={`${styles.toolBtn} ${activeTool === 'arrow' ? styles.active : ''}`} onClick={() => onToolChange('arrow')} data-tooltip="Arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                    <button className={`${styles.toolBtn} ${activeTool === 'text' ? styles.active : ''}`} onClick={() => onToolChange('text')} data-tooltip="Text">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                    </button>
                </div>

                {/* Style */}
                <div className={styles.toolGroup}>
                    <div className={styles.toolLabel}>Style</div>
                    <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} className={styles.colorPicker} title="Color" />
                    <div className={styles.divider} />
                    <input type="range" min="1" max="25" value={thickness} onChange={(e) => onThicknessChange(parseInt(e.target.value))} className={styles.thicknessSlider} title="Width" />
                </div>

                {/* Canvas Background */}
                <div className={styles.toolGroup}>
                    <div className={styles.toolLabel}>Canvas</div>
                    <input 
                        type="color" 
                        value={activeDrawing?.backgroundColor || (theme === 'dark' ? '#1a1a1a' : '#ffffff')} 
                        onChange={(e) => updateDrawing(activeDrawing.id, { backgroundColor: e.target.value })} 
                        className={styles.colorPicker} 
                        title="Background Color" 
                    />
                    <button className={styles.toolBtn} onClick={() => updateDrawing(activeDrawing.id, { backgroundColor: null })} data-tooltip="Reset Background">↺</button>
                </div>

                {/* Zoom */}
                <div className={styles.toolGroup}>
                    <div className={styles.toolLabel}>Zoom</div>
                    <button className={styles.toolBtn} onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}>-</button>
                    <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
                    <button className={styles.toolBtn} onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}>+</button>
                </div>

                <div className={styles.toolbarSpacer} />

                {/* Actions */}
                <div className={styles.toolGroup}>
                    <button className={styles.toolBtn} onClick={toggle} data-tooltip="Toggle Theme">
                        {theme === 'dark' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        )}
                    </button>
                    <div className={styles.divider} />
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                    <button className={styles.toolBtn} onClick={() => fileInputRef.current.click()} data-tooltip="Upload Image">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <span>Upload</span>
                    </button>
                    <button className={styles.toolBtn} onClick={handleExportPDF} disabled={isExporting} data-tooltip="Export PDF">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                        <span>PDF</span>
                    </button>
                    <div className={styles.divider} />
                    <button className={styles.toolBtn} onClick={() => { if(confirm('Clear entire sketch?')) onToolChange('clear') }} data-tooltip="Clear All">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

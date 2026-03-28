import { useState, useEffect, useCallback } from 'react'
import styles from '../notepad.module.scss'
import ThemeToggler from '../../../shared/components/ThemeToggler'

/**
 * Toolbar font options
 */
const FONTS = [
    { label: 'Mono', value: 'JetBrains Mono' },
    { label: 'Syne', value: 'Syne' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Courier', value: 'Courier New' },
    { label: 'Arial', value: 'Arial' },
]

/**
 * Toolbar font size options
 */
const SIZES = ['12', '14', '16', '18', '20', '24', '28', '32']

/**
 * Toolbar text color options
 */
const COLORS = [
    { label: 'White', value: '#f0f0f0' },
    { label: 'Green', value: '#00ff88' },
    { label: 'Red', value: '#ff4d4d' },
    { label: 'Blue', value: '#4a9eff' },
    { label: 'Yellow', value: '#ffd166' },
    { label: 'Purple', value: '#cc88ff' },
    { label: 'Orange', value: '#ff8844' },
]

/**
 * Helper to execute document commands for rich text editing
 */
const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
}

/**
 * Notepad Toolbar Component
 * 
 * Provides text formatting, voice-to-text, and export utilities.
 */
export default function Toolbar({ onDownload, onHome, onBack }) {
    const [isRecording, setIsRecording] = useState(false)
    const [recognition, setRecognition] = useState(null)
    const [interimTranscript, setInterimTranscript] = useState('')

    // Initialize Speech Recognition on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const rec = new SpeechRecognition()
                rec.continuous = true
                rec.interimResults = true
                rec.lang = 'en-US'

                // Optimized result handler to only process new segments
                rec.onresult = (event) => {
                    let finalTranscript = ''
                    let interim = ''

                    // Iterate from the resultIndex (the first new result in this event)
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        const transcript = event.results[i][0].transcript
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript
                        } else {
                            interim += transcript
                        }
                    }

                    // Insert final results as soon as they are ready
                    if (finalTranscript) {
                        exec('insertText', finalTranscript)
                        setInterimTranscript('')
                    } else {
                        // Update live preview for immediate feedback (feels much faster)
                        setInterimTranscript(interim)
                    }
                }


                // Handle recognition errors
                rec.onerror = (err) => {
                    // "no-speech" is common and often non-fatal for persistent listening
                    if (err.error !== 'no-speech') {
                        console.error('Speech recognition error:', err)
                        setIsRecording(false)
                    }
                }

                // Sync UI state when recognition stops
                rec.onend = () => {
                    setIsRecording(false)
                }

                setRecognition(rec)
            }
        }
    }, [])

    /**
     * Start/Stop voice-to-text processing
     */
    const toggleVoice = useCallback(() => {
        if (!recognition) {
            alert('Speech recognition is not supported in this browser.')
            return
        }

        if (isRecording) {
            recognition.stop()
        } else {
            try {
                recognition.start()
                setIsRecording(true)
            } catch (e) {
                // If already started, just sync the state
                setIsRecording(true)
            }
        }
    }, [isRecording, recognition])

    /**
     * Prevent toolbar buttons from stealing focus from the contentEditable editor.
     * This is critical for document.execCommand to work correctly.
     */
    const handleBtnMouseDown = (e) => {
        e.preventDefault()
    }

    return (
        <div className={styles.toolbar}>
            <div className={styles.toolRow}>

                {/* Back to List (visible on small screens) */}
                <button 
                    className={styles.mobileBack} 
                    onClick={onBack} 
                    onMouseDown={handleBtnMouseDown}
                    title="Back to List"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>

                {/* Main Home Button */}
                <button 
                    className={styles.toolBtn} 
                    onClick={onHome} 
                    onMouseDown={handleBtnMouseDown}
                    title="Return Home" 
                    style={{ marginRight: '0.25rem' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    <span>Home</span>
                </button>

                <div className={styles.divider} style={{ height: '24px', marginRight: '0.5rem' }} />

                {/* Undo / Redo */}
                <div className={styles.toolGroup}>
                    <label className={styles.toolLabel}>History</label>
                    <div className={styles.btnRow}>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('undo')} title="Undo (Ctrl+Z)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('redo')} title="Redo (Ctrl+Y)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
                        </button>
                    </div>
                </div>

                {/* Typography (Font family & Size) */}
                <div className={styles.toolGroup}>
                    <label className={styles.toolLabel}>Text</label>
                    <select className={styles.toolSelect} onMouseDown={handleBtnMouseDown} onChange={e => exec('fontName', e.target.value)} title="Font Family">
                        {FONTS.map(f => (
                            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                        ))}
                    </select>
                    <div className={styles.divider} />
                    <select className={styles.toolSelect} onMouseDown={handleBtnMouseDown} onChange={e => exec('fontSize', e.target.value)} title="Font Size">
                        {SIZES.map(s => (
                            <option key={s} value={s}>{s}px</option>
                        ))}
                    </select>
                </div>

                {/* Basic Text Styles */}
                <div className={styles.toolGroup}>
                    <label className={styles.toolLabel}>Style</label>
                    <div className={styles.btnRow}>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('bold')} title="Bold">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 12h9a4 4 0 0 1 0 8H6v-8Z" /><path d="M6 4h7a4 4 0 0 1 0 8H6V4Z" /></svg>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('italic')} title="Italic">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('underline')} title="Underline">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 12 0V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('strikeThrough')} title="Strikethrough">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Alignment & Lists */}
                <div className={styles.toolGroup}>
                    <label className={styles.toolLabel}>Paragraph</label>
                    <div className={styles.btnRow}>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('justifyLeft')} title="Align Left">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6" /><line x1="15" y1="12" x2="3" y2="12" /><line x1="17" y1="18" x2="3" y2="18" /></svg>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('justifyCenter')} title="Align Center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6" /><line x1="18" y1="12" x2="6" y2="12" /><line x1="19" y1="18" x2="5" y2="18" /></svg>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('justifyRight')} title="Align Right">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="9" y2="12" /><line x1="21" y1="18" x2="7" y2="18" /></svg>
                        </button>
                        <div className={styles.divider} />
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('insertUnorderedList')} title="Bullet List">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></svg>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('insertOrderedList')} title="Numbered List">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
                        </button>
                    </div>
                </div>

                {/* Hyperlinks & Clear Format */}
                <div className={styles.toolGroup}>
                    <label className={styles.toolLabel}>Insert</label>
                    <div className={styles.btnRow}>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => {
                            const url = prompt('Enter URL:')
                            if (url) exec('createLink', url)
                        }} title="Insert Link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => exec('removeFormat')} title="Clear Formatting">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 0-14h8.5a4.5 4.5 0 1 1 0 9H10.5" /><polyline points="13.5 13.5 10.5 10.5 13.5 7.5" /></svg>
                        </button>
                    </div>
                </div>

                {/* Text Colors */}
                <div className={styles.toolGroup}>
                    <label className={styles.toolLabel}>Colors</label>
                    <div className={styles.colorRow}>
                        {COLORS.map(c => (
                            <button
                                key={c.value}
                                className={styles.colorSwatch}
                                style={{ background: c.value }}
                                onMouseDown={handleBtnMouseDown}
                                onClick={() => exec('foreColor', c.value)}
                                title={c.label}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.toolbarSpacer} />

                {/* Final Utilities (Voice & Export) */}
                <div className={styles.toolGroup} style={{ background: 'transparent', border: 'none' }}>
                    <div className={styles.btnRow}>
                        <button 
                            className={`${styles.toolBtn} ${isRecording ? styles.recording : ''}`} 
                            onMouseDown={handleBtnMouseDown}
                            onClick={toggleVoice}
                            title={isRecording ? "Stop Recording" : "Start Voice Typing"}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
                            <span>Voice</span>
                        </button>

                        {/* Live feedback of interim speech results (makes it feel much faster) */}
                        {isRecording && interimTranscript && (
                            <div className={styles.livePreview}>
                                <em>Listening:</em><br />
                                {interimTranscript}...
                            </div>
                        )}

                        <div className={styles.divider} />
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => onDownload('txt')} title="Download as .txt">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            <span>TXT</span>
                        </button>
                        <button className={styles.toolBtn} onMouseDown={handleBtnMouseDown} onClick={() => onDownload('md')} title="Download as .md">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            <span>MD</span>
                        </button>
                    </div>
                </div>

                <ThemeToggler />
            </div>
        </div>
    )
}
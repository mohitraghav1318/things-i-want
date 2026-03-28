import { useNavigate } from 'react-router-dom'
import ThemeToggler from '../shared/components/ThemeToggler'
import styles from './Home.module.scss'

const tools = [
    { id: 'notepad', label: 'Notepad', path: '/notepad', tag: 'text', desc: 'Write, save & organize notes locally.', icon: '📝', status: 'ready' },
    { id: 'draw', label: 'Draw', path: '/draw', tag: 'canvas', desc: 'Sketch and doodle on a blank canvas.', icon: '🎨', status: 'soon' },
    { id: 'url-shortner', label: 'URL Shortener', path: '/url-shortner', tag: 'web', desc: 'Shrink long URLs instantly.', icon: '🔗', status: 'soon' },
    { id: 'live-image', label: 'Image Link', path: '/live-image', tag: 'media', desc: 'Upload images, get shareable links.', icon: '🖼️', status: 'soon' },
    { id: 'voice-room', label: 'Voice Room', path: '/voice-room', tag: 'audio', desc: 'Real-time voice chat rooms.', icon: '🎙️', status: 'soon' },
]

export default function Home() {
    const navigate = useNavigate()

    return (
        <div className={styles.home}>
            <div className={styles.topRight}>
                <ThemeToggler />
            </div>

            <header className={styles.header}>
                <p className={styles.label}>// personal toolkit</p>
                <h1 className={styles.title}>things<span>-i-want</span></h1>
                <p className={styles.sub}>A collection of tools built for daily use.</p>
            </header>

            <div className={styles.grid}>
                {tools.map((tool, i) => (
                    <div
                        key={tool.id}
                        className={`${styles.card} ${tool.status === 'soon' ? styles.disabled : ''}`}
                        style={{ animationDelay: `${i * 80}ms` }}
                        onClick={() => tool.status === 'ready' && navigate(tool.path)}
                    >
                        <div className={styles.cardTop}>
                            <span className={styles.icon}>{tool.icon}</span>
                            <span className={styles.tag}>{tool.tag}</span>
                        </div>
                        <h2 className={styles.cardTitle}>{tool.label}</h2>
                        <p className={styles.cardDesc}>{tool.desc}</p>
                        <div className={styles.cardFooter}>
                            {tool.status === 'ready'
                                ? <span className={styles.ready}>● ready</span>
                                : <span className={styles.soon}>◌ soon</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
import { useTheme } from '../hooks/useTheme.jsx'
import styles from './ThemeToggler.module.scss'

export default function ThemeToggler() {
    const { theme, toggle } = useTheme()
    return (
        <button
            className={styles.toggler}
            onClick={toggle}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <span className={styles.icon}>
                {theme === 'dark' ? '☀︎' : '☽'}
            </span>
            <span className={styles.label}>
                {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
        </button>
    )
}
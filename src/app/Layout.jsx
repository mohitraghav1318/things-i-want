export default function Layout({ children }) {
    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            {children}
        </div>
    )
}
export function useEditorStats(html) {
    const text = html?.replace(/<[^>]*>/g, '') || ''
    const chars = text.length
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    return { words, chars }
}
import type { Editor } from '@tiptap/react'
import { generateJSON } from '@tiptap/react'
import { createExtensions } from './extensions'

/**
 * Convert TipTap editor instance to HTML
 * Uses the editor's built-in getHTML() method
 */
export function editorToHTML(editor: Editor): string {
  return editor.getHTML()
}

/**
 * Convert HTML string to TipTap JSONContent format
 * Used when loading saved HTML content into the editor
 *
 * NOTE: This function requires DOM API and will return undefined during SSR
 */
export const htmlToEditor = (html: string) => {
  // Guard: generateJSON requires window/DOM, not available during SSR
  if (typeof window === 'undefined') {
    return undefined
  }

  const extensions = createExtensions()
  return generateJSON(html, extensions)
}


/**
 * Extract plain text from HTML (for description field)
 * Max 200 chars by default, smart truncation at word boundaries
 *
 * @param html - HTML string from editor
 * @param maxLength - Maximum length of extracted text (default: 200)
 * @returns Plain text string, truncated if necessary
 */
export function htmlToPlainText(html: string, maxLength = 200): string {
  // Remove HTML tags and normalize whitespace
  const text = html
    .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&lt;/g, '<') // Decode HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()

  if (text.length <= maxLength) return text

  // Truncate at word boundary for better readability
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  // Only use word boundary if it's not too early (>70% of maxLength)
  if (lastSpace > maxLength * 0.7) {
    return `${truncated.slice(0, lastSpace)}...`
  }

  return `${truncated}...`
}

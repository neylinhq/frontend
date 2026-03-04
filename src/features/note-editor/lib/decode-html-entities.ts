/**
 * Decode common HTML entities in markdown content.
 * Handles legacy content that was stored as HTML from a rich text editor.
 */
export const decodeHtmlEntities = (text: string): string => {
  if (!text || !text.includes('&')) return text

  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

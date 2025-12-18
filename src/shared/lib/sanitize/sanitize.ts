import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitizes HTML string to prevent XSS attacks.
 * Uses DOMPurify with a whitelist of safe tags and attributes.
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'a',
      'code',
      'pre',
      'blockquote',
      'span',
      'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  })
}

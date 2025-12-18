/**
 * Editor Converter Types
 *
 * Types for HTML <-> Markdown conversion used for backward compatibility
 * when switching between Tiptap (HTML) and CodeMirror (Markdown) editors.
 */

/**
 * Options for HTML to Markdown conversion
 */
export interface HtmlToMarkdownOptions {
  /** Preserve line breaks as <br> */
  preserveLineBreaks?: boolean
  /** Use GitHub Flavored Markdown */
  gfm?: boolean
  /** Code block style: 'fenced' or 'indented' */
  codeBlockStyle?: 'fenced' | 'indented'
  /** Heading style: 'atx' (#) or 'setext' (underline) */
  headingStyle?: 'atx' | 'setext'
  /** Bullet list marker */
  bulletListMarker?: '-' | '*' | '+'
}

/**
 * Options for Markdown to HTML conversion
 */
export interface MarkdownToHtmlOptions {
  /** Use GitHub Flavored Markdown */
  gfm?: boolean
  /** Enable syntax highlighting for code blocks */
  syntaxHighlight?: boolean
  /** Sanitize output HTML */
  sanitize?: boolean
  /** Enable breaks (convert \n to <br>) */
  breaks?: boolean
}

/**
 * Conversion result with metadata
 */
export interface ConversionResult<T> {
  /** Converted content */
  content: T
  /** Whether conversion was successful */
  success: boolean
  /** Error message if conversion failed */
  error?: string
  /** Warnings about potential data loss */
  warnings?: string[]
}

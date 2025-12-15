/**
 * Editor Converter Feature
 *
 * Provides bidirectional conversion between HTML and Markdown
 * for backward compatibility when switching between editors.
 *
 * Storage format: HTML (for compatibility with existing content)
 * CodeMirror format: Markdown (native format for Live Preview)
 *
 * @example
 * // Load content for CodeMirror
 * const markdown = toMarkdown(htmlFromStorage)
 *
 * // Save content from CodeMirror
 * const html = toHtml(markdownFromEditor)
 */

export { htmlToMarkdown, toMarkdown } from './lib/html-to-markdown'
export { markdownToHtml, toHtml } from './lib/markdown-to-html'
export type {
  ConversionResult,
  HtmlToMarkdownOptions,
  MarkdownToHtmlOptions
} from './model/converter.types'

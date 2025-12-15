/**
 * Markdown to HTML Converter
 *
 * Converts Markdown content (from CodeMirror) to HTML (for storage/Tiptap).
 * Uses Marked library with custom extensions for Obsidian-style features.
 */

import { marked, type MarkedExtension, type Tokens } from 'marked'
import type { ConversionResult, MarkdownToHtmlOptions } from '../model/converter.types'

/**
 * Helper to escape HTML
 */
const escapeHtml = (text: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, char => htmlEscapes[char])
}

/**
 * Custom marked extension for Obsidian-style callouts
 * Syntax: > [!type] Title
 *         > Content
 */
const calloutExtension: MarkedExtension = {
  extensions: [
    {
      name: 'callout',
      level: 'block',
      start(src: string) {
        return src.match(/^>\s*\[!/)?.index
      },
      tokenizer(src: string) {
        const rule = /^(?:>\s*\[!(\w+)\](?:-|\+)?\s*(.*)?\n)((?:>.*\n?)*)/
        const match = rule.exec(src)

        if (match) {
          const type = match[1].toLowerCase()
          const title = match[2]?.trim() || type.charAt(0).toUpperCase() + type.slice(1)
          const rawContent = match[3]
          const content = rawContent
            .split('\n')
            .map(line => line.replace(/^>\s?/, ''))
            .join('\n')
            .trim()

          return {
            type: 'callout',
            raw: match[0],
            calloutType: type,
            title,
            content
          }
        }
        return undefined
      },
      renderer(token: Tokens.Generic) {
        const { calloutType, title, content } = token as Tokens.Generic & {
          calloutType: string
          title: string
          content: string
        }
        const parsedContent = marked.parse(content, { async: false }) as string
        return `<div data-callout="${calloutType}" class="callout callout-${calloutType}">
  <div class="callout-title">${title}</div>
  <div class="callout-content">${parsedContent}</div>
</div>\n`
      }
    }
  ]
}

/**
 * Custom marked extension for math blocks ($$...$$)
 */
const mathBlockExtension: MarkedExtension = {
  extensions: [
    {
      name: 'mathBlock',
      level: 'block',
      start(src: string) {
        return src.match(/^\$\$/)?.index
      },
      tokenizer(src: string) {
        const rule = /^\$\$([\s\S]*?)\$\$/
        const match = rule.exec(src)
        if (match) {
          return {
            type: 'mathBlock',
            raw: match[0],
            latex: match[1].trim()
          }
        }
        return undefined
      },
      renderer(token: Tokens.Generic) {
        const { latex } = token as Tokens.Generic & { latex: string }
        return `<div data-math-block="true" data-latex="${escapeHtml(latex)}" class="math-block">${escapeHtml(latex)}</div>\n`
      }
    }
  ]
}

/**
 * Custom marked extension for inline math ($...$)
 */
const mathInlineExtension: MarkedExtension = {
  extensions: [
    {
      name: 'mathInline',
      level: 'inline',
      start(src: string) {
        return src.match(/\$(?!\$)/)?.index
      },
      tokenizer(src: string) {
        const rule = /^\$([^\$\n]+)\$/
        const match = rule.exec(src)
        if (match) {
          return {
            type: 'mathInline',
            raw: match[0],
            latex: match[1].trim()
          }
        }
        return undefined
      },
      renderer(token: Tokens.Generic) {
        const { latex } = token as Tokens.Generic & { latex: string }
        return `<span data-math-inline="true" data-latex="${escapeHtml(latex)}" class="math-inline">${escapeHtml(latex)}</span>`
      }
    }
  ]
}

/**
 * Custom marked extension for highlights (==text==)
 */
const highlightExtension: MarkedExtension = {
  extensions: [
    {
      name: 'highlight',
      level: 'inline',
      start(src: string) {
        return src.match(/==/)?.index
      },
      tokenizer(src: string) {
        const rule = /^==([^=]+)==/
        const match = rule.exec(src)
        if (match) {
          return {
            type: 'highlight',
            raw: match[0],
            text: match[1]
          }
        }
        return undefined
      },
      renderer(token: Tokens.Generic) {
        const { text } = token as Tokens.Generic & { text: string }
        return `<mark>${text}</mark>`
      }
    }
  ]
}

/**
 * Custom marked extension for subscript (~text~)
 */
const subscriptExtension: MarkedExtension = {
  extensions: [
    {
      name: 'subscript',
      level: 'inline',
      start(src: string) {
        return src.match(/~(?!~)/)?.index
      },
      tokenizer(src: string) {
        const rule = /^~([^~\n]+)~/
        const match = rule.exec(src)
        if (match) {
          return {
            type: 'subscript',
            raw: match[0],
            text: match[1]
          }
        }
        return undefined
      },
      renderer(token: Tokens.Generic) {
        const { text } = token as Tokens.Generic & { text: string }
        return `<sub>${text}</sub>`
      }
    }
  ]
}

/**
 * Custom marked extension for superscript (^text^)
 */
const superscriptExtension: MarkedExtension = {
  extensions: [
    {
      name: 'superscript',
      level: 'inline',
      start(src: string) {
        return src.match(/\^(?!\^)/)?.index
      },
      tokenizer(src: string) {
        const rule = /^\^([^\^\n]+)\^/
        const match = rule.exec(src)
        if (match) {
          return {
            type: 'superscript',
            raw: match[0],
            text: match[1]
          }
        }
        return undefined
      },
      renderer(token: Tokens.Generic) {
        const { text } = token as Tokens.Generic & { text: string }
        return `<sup>${text}</sup>`
      }
    }
  ]
}

/**
 * Configure marked with all extensions
 */
const configureMarked = (options: MarkdownToHtmlOptions = {}): void => {
  // Apply all custom extensions
  marked.use(calloutExtension)
  marked.use(mathBlockExtension)
  marked.use(mathInlineExtension)
  marked.use(highlightExtension)
  marked.use(subscriptExtension)
  marked.use(superscriptExtension)

  // Configure base options
  marked.use({
    gfm: options.gfm ?? true,
    breaks: options.breaks ?? true
  })

  // Custom renderer for task lists and code blocks
  marked.use({
    renderer: {
      listitem({ text, task, checked }: Tokens.ListItem) {
        if (task) {
          const checkbox = `<input type="checkbox" ${checked ? 'checked' : ''} disabled>`
          return `<li class="task-item">${checkbox} ${text}</li>\n`
        }
        return `<li>${text}</li>\n`
      },
      code({ text, lang }: Tokens.Code) {
        const language = lang || ''
        const languageAttr = language ? ` data-language="${language}"` : ''
        const classAttr = language ? ` class="language-${language}"` : ''
        return `<pre><code${languageAttr}${classAttr}>${escapeHtml(text)}</code></pre>\n`
      }
    }
  })
}

// Initialize marked with default configuration
configureMarked()

/**
 * Convert Markdown to HTML
 *
 * @param markdown - Markdown string from editor
 * @param options - Conversion options
 * @returns HTML string
 */
export const markdownToHtml = (
  markdown: string,
  options: MarkdownToHtmlOptions = {}
): ConversionResult<string> => {
  if (!markdown || markdown.trim() === '') {
    return {
      content: '',
      success: true
    }
  }

  try {
    // Reconfigure if options differ from defaults
    if (options.gfm !== undefined || options.breaks !== undefined) {
      configureMarked(options)
    }

    const html = marked.parse(markdown, { async: false }) as string

    return {
      content: html.trim(),
      success: true
    }
  } catch (error) {
    return {
      content: `<p>${escapeHtml(markdown)}</p>`,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    }
  }
}

/**
 * Quick conversion without options (for simple cases)
 */
export const toHtml = (markdown: string): string => {
  const result = markdownToHtml(markdown)
  return result.content
}

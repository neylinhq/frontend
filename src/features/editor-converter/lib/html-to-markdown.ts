/**
 * HTML to Markdown Converter
 *
 * Converts HTML content (from Tiptap/storage) to Markdown (for CodeMirror).
 * Uses Turndown library with custom rules for Obsidian-style extensions.
 */

import TurndownService from 'turndown'
import type { ConversionResult, HtmlToMarkdownOptions } from '../model/converter.types'

/**
 * Create a configured Turndown instance with custom rules
 */
const createTurndownService = (options: HtmlToMarkdownOptions = {}): TurndownService => {
  const turndown = new TurndownService({
    headingStyle: options.headingStyle ?? 'atx',
    codeBlockStyle: options.codeBlockStyle ?? 'fenced',
    bulletListMarker: options.bulletListMarker ?? '-',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    preformattedCode: true
  })

  // Custom rule for task lists
  turndown.addRule('taskListItem', {
    filter: (node) => {
      return (
        node.nodeName === 'LI' &&
        node.parentNode?.nodeName === 'UL' &&
        (node.parentNode as Element).classList?.contains('task-list')
      )
    },
    replacement: (content, node) => {
      const checkbox = (node as Element).querySelector('input[type="checkbox"]')
      const isChecked = checkbox?.hasAttribute('checked')
      const prefix = isChecked ? '- [x] ' : '- [ ] '
      // Remove the checkbox content from the output
      const cleanContent = content.replace(/^\s*\[.\]\s*/, '').trim()
      return prefix + cleanContent + '\n'
    }
  })

  // Custom rule for callouts (Obsidian-style)
  turndown.addRule('callout', {
    filter: (node) => {
      return (
        node.nodeName === 'DIV' &&
        (node as Element).hasAttribute('data-callout')
      )
    },
    replacement: (content, node) => {
      const element = node as Element
      const type = element.getAttribute('data-callout') || 'note'
      const title = element.querySelector('.callout-title')?.textContent || ''
      const body = element.querySelector('.callout-content')?.textContent || content

      let result = `> [!${type}]`
      if (title && title.toLowerCase() !== type.toLowerCase()) {
        result += ` ${title}`
      }
      result += '\n'

      // Add body lines with > prefix
      const bodyLines = body.trim().split('\n')
      for (const line of bodyLines) {
        result += `> ${line}\n`
      }

      return result + '\n'
    }
  })

  // Custom rule for code blocks with language
  turndown.addRule('codeBlockWithLanguage', {
    filter: (node) => {
      return (
        node.nodeName === 'PRE' &&
        node.firstChild?.nodeName === 'CODE'
      )
    },
    replacement: (_content, node) => {
      const codeElement = node.firstChild as Element
      const language = codeElement?.getAttribute('data-language') ||
        codeElement?.className?.match(/language-(\w+)/)?.[1] ||
        ''
      const code = codeElement?.textContent || ''

      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`
    }
  })

  // Custom rule for math blocks
  turndown.addRule('mathBlock', {
    filter: (node) => {
      return (
        node.nodeName === 'DIV' &&
        (node as Element).hasAttribute('data-math-block')
      )
    },
    replacement: (_content, node) => {
      const latex = (node as Element).getAttribute('data-latex') ||
        (node as Element).textContent || ''
      return `\n$$\n${latex}\n$$\n\n`
    }
  })

  // Custom rule for inline math
  turndown.addRule('mathInline', {
    filter: (node) => {
      return (
        node.nodeName === 'SPAN' &&
        (node as Element).hasAttribute('data-math-inline')
      )
    },
    replacement: (_content, node) => {
      const latex = (node as Element).getAttribute('data-latex') ||
        (node as Element).textContent || ''
      return `$${latex}$`
    }
  })

  // Custom rule for details/summary (collapsible)
  turndown.addRule('details', {
    filter: 'details',
    replacement: (content, node) => {
      const summary = (node as Element).querySelector('summary')?.textContent || 'Details'
      const bodyContent = content.replace(summary, '').trim()

      // Obsidian doesn't have native details, convert to callout
      return `> [!info]- ${summary}\n> ${bodyContent.split('\n').join('\n> ')}\n\n`
    }
  })

  // Custom rule for highlights
  turndown.addRule('highlight', {
    filter: 'mark',
    replacement: (content) => `==${content}==`
  })

  // Custom rule for strikethrough
  turndown.addRule('strikethrough', {
    filter: ['del', 's'],
    replacement: (content) => `~~${content}~~`
  })

  // Custom rule for subscript
  turndown.addRule('subscript', {
    filter: 'sub',
    replacement: (content) => `~${content}~`
  })

  // Custom rule for superscript
  turndown.addRule('superscript', {
    filter: 'sup',
    replacement: (content) => `^${content}^`
  })

  return turndown
}

/**
 * Convert HTML to Markdown
 *
 * @param html - HTML string from editor/storage
 * @param options - Conversion options
 * @returns Markdown string
 */
export const htmlToMarkdown = (
  html: string,
  options: HtmlToMarkdownOptions = {}
): ConversionResult<string> => {
  if (!html || html.trim() === '') {
    return {
      content: '',
      success: true
    }
  }

  try {
    const turndown = createTurndownService(options)
    const markdown = turndown.turndown(html)

    // Clean up excessive newlines
    const cleanedMarkdown = markdown
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return {
      content: cleanedMarkdown,
      success: true
    }
  } catch (error) {
    return {
      content: html, // Return original on error
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    }
  }
}

/**
 * Quick conversion without options (for simple cases)
 */
export const toMarkdown = (html: string): string => {
  const result = htmlToMarkdown(html)
  return result.content
}

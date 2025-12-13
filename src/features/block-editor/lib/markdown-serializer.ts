import type { JSONContent } from '@tiptap/core'

/**
 * Converts TipTap JSONContent to Markdown string
 */
export const jsonToMarkdown = (content: JSONContent): string => {
  if (!content) {
    return ''
  }

  if (content.type === 'doc') {
    return (content.content || []).map(node => nodeToMarkdown(node)).join('\n\n')
  }

  return nodeToMarkdown(content)
}

const nodeToMarkdown = (node: JSONContent, depth = 0): string => {
  if (!node) {
    return ''
  }

  switch (node.type) {
    case 'paragraph':
      return inlineToMarkdown(node.content)

    case 'heading': {
      const level = node.attrs?.level || 1
      const prefix = '#'.repeat(level)
      return `${prefix} ${inlineToMarkdown(node.content)}`
    }

    case 'bulletList':
      return (node.content || [])
        .map(item => {
          const indent = '  '.repeat(depth)
          const itemContent = listItemToMarkdown(item, depth)
          return `${indent}- ${itemContent}`
        })
        .join('\n')

    case 'orderedList':
      return (node.content || [])
        .map((item, index) => {
          const indent = '  '.repeat(depth)
          const itemContent = listItemToMarkdown(item, depth)
          return `${indent}${index + 1}. ${itemContent}`
        })
        .join('\n')

    case 'taskList':
      return (node.content || [])
        .map(item => {
          const checked = item.attrs?.checked ? 'x' : ' '
          const indent = '  '.repeat(depth)
          const itemContent = listItemToMarkdown(item, depth)
          return `${indent}- [${checked}] ${itemContent}`
        })
        .join('\n')

    case 'listItem':
    case 'taskItem':
      return listItemToMarkdown(node, depth)

    case 'blockquote':
      return (node.content || []).map(child => `> ${nodeToMarkdown(child, depth)}`).join('\n> \n')

    case 'codeBlock': {
      const language = node.attrs?.language || ''
      const code = node.content?.[0]?.text || ''
      return `\`\`\`${language}\n${code}\n\`\`\``
    }

    case 'horizontalRule':
      return '---'

    case 'image': {
      const src = node.attrs?.src || ''
      const alt = node.attrs?.alt || ''
      const title = node.attrs?.title || ''
      return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
    }

    case 'imageFigure': {
      const src = node.attrs?.src || ''
      const alt = node.attrs?.alt || ''
      const caption = node.attrs?.caption || ''
      return caption ? `![${alt}](${src})\n*${caption}*` : `![${alt}](${src})`
    }

    case 'table':
      return tableToMarkdown(node)

    case 'mathBlock': {
      const latex = node.attrs?.latex || ''
      return `$$\n${latex}\n$$`
    }

    case 'callout': {
      const type = node.attrs?.type || 'info'
      const content = (node.content || []).map(child => nodeToMarkdown(child, depth)).join('\n')
      return `> [!${type.toUpperCase()}]\n> ${content.split('\n').join('\n> ')}`
    }

    case 'details': {
      const summary =
        node.content?.find(c => c.type === 'detailsSummary')?.content?.[0]?.text || 'Details'
      const detailsContent =
        node.content
          ?.find(c => c.type === 'detailsContent')
          ?.content?.map(child => nodeToMarkdown(child, depth))
          .join('\n') || ''
      return `<details>\n<summary>${summary}</summary>\n\n${detailsContent}\n</details>`
    }

    case 'columns':
      // Columns don't have direct Markdown equivalent, render as sequential blocks
      return (node.content || [])
        .flatMap(column => column.content || [])
        .map(child => nodeToMarkdown(child, depth))
        .join('\n\n')

    case 'tableOfContents':
      return '[TOC]'

    case 'videoEmbed': {
      const src = node.attrs?.src || ''
      return `[Video](${src})`
    }

    default:
      // Fallback for unknown nodes
      if (node.content) {
        return inlineToMarkdown(node.content)
      }
      return ''
  }
}

const listItemToMarkdown = (item: JSONContent, depth: number): string => {
  if (!item.content) {
    return ''
  }

  const parts: string[] = []

  for (const child of item.content) {
    if (child.type === 'paragraph') {
      parts.push(inlineToMarkdown(child.content))
    } else if (
      child.type === 'bulletList' ||
      child.type === 'orderedList' ||
      child.type === 'taskList'
    ) {
      parts.push(`\n${nodeToMarkdown(child, depth + 1)}`)
    } else {
      parts.push(nodeToMarkdown(child, depth))
    }
  }

  return parts.join('')
}

const inlineToMarkdown = (content: JSONContent[] | undefined): string => {
  if (!content) {
    return ''
  }

  return content
    .map(node => {
      if (node.type === 'text') {
        let text = node.text || ''
        const marks = node.marks || []

        // Apply marks in order (nested)
        for (const mark of marks) {
          switch (mark.type) {
            case 'bold':
              text = `**${text}**`
              break
            case 'italic':
              text = `*${text}*`
              break
            case 'strike':
              text = `~~${text}~~`
              break
            case 'code':
              text = `\`${text}\``
              break
            case 'link':
              text = `[${text}](${mark.attrs?.href || ''})`
              break
            case 'underline':
              text = `<u>${text}</u>`
              break
            case 'subscript':
              text = `<sub>${text}</sub>`
              break
            case 'superscript':
              text = `<sup>${text}</sup>`
              break
            // highlight and color don't have Markdown equivalents
          }
        }

        return text
      }

      if (node.type === 'mathInline') {
        return `$${node.attrs?.latex || ''}$`
      }

      if (node.type === 'hardBreak') {
        return '  \n'
      }

      return ''
    })
    .join('')
}

const tableToMarkdown = (table: JSONContent): string => {
  if (!table.content) {
    return ''
  }

  const rows = table.content.filter(row => row.type === 'tableRow')
  if (rows.length === 0) {
    return ''
  }

  const lines: string[] = []

  // First row (header or data)
  const firstRow = rows[0]
  const headerCells = (firstRow.content || []).map(cell => {
    const cellContent = (cell.content || []).map(p => inlineToMarkdown(p.content)).join(' ')
    return cellContent || ' '
  })
  lines.push(`| ${headerCells.join(' | ')} |`)

  // Separator
  const separator = headerCells.map(() => '---')
  lines.push(`| ${separator.join(' | ')} |`)

  // Data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const cells = (row.content || []).map(cell => {
      const cellContent = (cell.content || []).map(p => inlineToMarkdown(p.content)).join(' ')
      return cellContent || ' '
    })
    lines.push(`| ${cells.join(' | ')} |`)
  }

  return lines.join('\n')
}

/**
 * Copy content as Markdown to clipboard
 */
export const copyAsMarkdown = async (content: JSONContent): Promise<boolean> => {
  try {
    const markdown = jsonToMarkdown(content)
    await navigator.clipboard.writeText(markdown)
    return true
  } catch {
    return false
  }
}

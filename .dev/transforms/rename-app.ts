import type { API, FileInfo, Options } from 'jscodeshift'

interface RenameOptions {
  from?: string // default: 'Neylin'
  to?: string // default: 'Name'
}

/**
 * jscodeshift transform to rename app name throughout the codebase.
 *
 * Usage:
 *   npx jscodeshift -t .dev/transforms/rename-app.ts src/ app/
 *   npx jscodeshift -t .dev/transforms/rename-app.ts --from=Neylin --to=MyApp src/
 *
 * Dry run:
 *   npx jscodeshift -t .dev/transforms/rename-app.ts --dry --print src/
 */
const transformer = (file: FileInfo, api: API, options: Options & RenameOptions) => {
  const j = api.jscodeshift
  const root = j(file.source)
  let hasChanges = false

  const fromName = options.from || 'Neylin'
  const toName = options.to || 'Name'
  const fromLower = fromName.toLowerCase()
  const toLower = toName.toLowerCase()

  // Helper: replace in string preserving case variants
  const replaceInString = (str: string): string => {
    let result = str
    // Exact case matches first
    result = result.replace(new RegExp(fromName, 'g'), toName) // Neylin -> Name
    result = result.replace(new RegExp(fromLower, 'g'), toLower) // neylin -> name
    // UPPERCASE variant
    result = result.replace(new RegExp(fromName.toUpperCase(), 'g'), toName.toUpperCase()) // ARBOR -> NAME
    return result
  }

  // 1. String literals
  root.find(j.StringLiteral).forEach(path => {
    const original = path.node.value
    const replaced = replaceInString(original)
    if (original !== replaced) {
      path.node.value = replaced
      hasChanges = true
    }
  })

  // 2. Template literals (template strings)
  root.find(j.TemplateLiteral).forEach(path => {
    path.node.quasis.forEach(quasi => {
      const original = quasi.value.raw
      const replaced = replaceInString(original)
      if (original !== replaced) {
        quasi.value.raw = replaced
        quasi.value.cooked = replaceInString(quasi.value.cooked || '')
        hasChanges = true
      }
    })
  })

  // 3. JSX Text nodes
  root.find(j.JSXText).forEach(path => {
    const original = path.node.value
    const replaced = replaceInString(original)
    if (original !== replaced) {
      path.node.value = replaced
      hasChanges = true
    }
  })

  // 4. Identifiers (variable names, function names, class names, etc.)
  root.find(j.Identifier).forEach(path => {
    const original = path.node.name
    const replaced = replaceInString(original)
    if (original !== replaced) {
      path.node.name = replaced
      hasChanges = true
    }
  })

  // 5. JSX Identifiers (component names in JSX)
  root.find(j.JSXIdentifier).forEach(path => {
    const original = path.node.name
    const replaced = replaceInString(original)
    if (original !== replaced) {
      path.node.name = replaced
      hasChanges = true
    }
  })

  // 6. Object property keys (when they are identifiers)
  root.find(j.Property).forEach(path => {
    if (path.node.key.type === 'Identifier') {
      const original = path.node.key.name
      const replaced = replaceInString(original)
      if (original !== replaced) {
        path.node.key.name = replaced
        hasChanges = true
      }
    }
  })

  // 7. Comments (leading, trailing, inner)
  root.find(j.Program).forEach(path => {
    const processComments = (comments: any[] | null | undefined) => {
      if (!comments) return
      comments.forEach(comment => {
        const original = comment.value
        const replaced = replaceInString(original)
        if (original !== replaced) {
          comment.value = replaced
          hasChanges = true
        }
      })
    }

    // Process all nodes for comments
    j(path)
      .find(j.Node)
      .forEach(nodePath => {
        processComments((nodePath.node as any).comments)
        processComments((nodePath.node as any).leadingComments)
        processComments((nodePath.node as any).trailingComments)
      })
  })

  return hasChanges ? root.toSource({ quote: 'single' }) : null
}

export default transformer

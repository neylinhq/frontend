import type { API, FileInfo } from 'jscodeshift'

const transformer = (file: FileInfo, api: API) => {
  const j = api.jscodeshift
  const root = j(file.source)
  let hasChanges = false

  // Transform: export function name() {} -> export const name = () => {}
  root
    .find(j.ExportNamedDeclaration, {
      declaration: { type: 'FunctionDeclaration' }
    })
    .forEach(path => {
      const funcDecl = path.node.declaration as any
      if (!funcDecl || funcDecl.type !== 'FunctionDeclaration') return

      const { id, params, body, async: isAsync, generator } = funcDecl

      // Skip generators - can't convert to arrow
      if (generator) return

      const arrowFunc = j.arrowFunctionExpression(params, body, false)
      arrowFunc.async = isAsync

      const varDeclarator = j.variableDeclarator(id, arrowFunc)
      const varDecl = j.variableDeclaration('const', [varDeclarator])

      path.node.declaration = varDecl
      hasChanges = true
    })

  // Transform: function name() {} -> const name = () => {}
  root.find(j.FunctionDeclaration).forEach(path => {
    const { id, params, body, async: isAsync, generator } = path.node

    // Skip generators
    if (generator) return
    // Skip if no id
    if (!id) return

    const arrowFunc = j.arrowFunctionExpression(params, body, false)
    arrowFunc.async = isAsync

    const varDeclarator = j.variableDeclarator(id, arrowFunc)
    const varDecl = j.variableDeclaration('const', [varDeclarator])

    j(path).replaceWith(varDecl)
    hasChanges = true
  })

  return hasChanges ? root.toSource({ quote: 'single' }) : null
}

export default transformer

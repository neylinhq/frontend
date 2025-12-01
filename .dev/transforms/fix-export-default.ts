import type { API, FileInfo } from 'jscodeshift'

// Fix invalid "export default const X = ..." syntax
// Transform to: const X = ...; export default X;
export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift
  const root = j(file.source)
  let hasChanges = false

  // Find export default declarations that are variable declarations (invalid)
  root.find(j.ExportDefaultDeclaration).forEach(path => {
    const decl = path.node.declaration

    // Check if it's a variable declaration (which is invalid for export default)
    if (decl && decl.type === 'VariableDeclaration') {
      const varDecl = decl as any
      const declarator = varDecl.declarations[0]

      if (declarator && declarator.id && declarator.id.name) {
        const name = declarator.id.name

        // Create: const X = ...
        const newVarDecl = j.variableDeclaration('const', [declarator])

        // Create: export default X
        const exportDefault = j.exportDefaultDeclaration(j.identifier(name))

        // Replace with both statements
        j(path).replaceWith([newVarDecl, exportDefault])
        hasChanges = true
      }
    }
  })

  return hasChanges ? root.toSource({ quote: 'single' }) : null
}

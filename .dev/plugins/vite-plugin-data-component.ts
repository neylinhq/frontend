/**
 * Vite Plugin: Auto data-component Attributes
 *
 * Injects data-component="layer:path" into root JSX elements of all FSD components
 * at build time. Enables instant element-to-source mapping in browser DevTools.
 *
 * Naming convention (derived from file path + variable name):
 *   pages:sign-in-page
 *   features:auth/sign-in-form
 *   features:graph/graph-core/graph-visualization
 *   widgets:dashboard-layout
 *   widgets:dashboard-layout/sidebar
 *   entities:edge/edge-type-button
 *   shared:button
 *   shared:card/card-header        (compound component sub-export)
 *
 * Handles: arrow functions, function declarations, memo(), forwardRef(),
 *          multiple returns, conditional JSX, compound component files.
 * Skips:   Fragments (<>), non-component files (index, test, hooks, model, lib).
 */

import { parse } from '@babel/parser'
import MagicString from 'magic-string'
import type { Plugin } from 'vite'

// ============================================================================
// Types
// ============================================================================

interface ComponentMeta {
  layer: string
  modulePath: string[]
}

interface DataComponentOptions {
  /** Remove data-component attributes in production build. Default: false */
  strip?: boolean
}

// ============================================================================
// Constants
// ============================================================================

const FSD_LAYERS = new Set(['pages', 'features', 'widgets', 'entities', 'shared'])

/** Directories that never contain UI components */
const SKIP_DIRS = new Set(['model', 'lib', 'api', 'styles', '__tests__', '__mocks__', 'mocks'])

/** File name patterns to skip */
const SKIP_FILE_RE = /^index$|\.test$|\.spec$|\.stories$/

// ============================================================================
// Path Resolution
// ============================================================================

/**
 * Extract FSD layer and module path from a file path.
 * Returns null for non-component files.
 */
function resolveComponentMeta(id: string): ComponentMeta | null {
  const normalized = id.replace(/\\/g, '/')
  if (!normalized.endsWith('.tsx')) return null

  const srcMatch = normalized.match(/\/src\/(.+)$/)
  if (!srcMatch) return null

  const relative = srcMatch[1]
  const segments = relative.split('/')
  const layer = segments[0]

  if (!FSD_LAYERS.has(layer)) return null

  const fileName = segments.at(-1)!.replace(/\.tsx$/, '')

  if (SKIP_FILE_RE.test(fileName)) return null
  // Skip dotted filenames like auth.hooks.tsx, session.model.tsx
  if (fileName.includes('.')) return null
  // Skip non-component directories
  if (segments.some(s => SKIP_DIRS.has(s))) return null

  if (layer === 'shared') {
    // Only tag files under shared/components/
    if (!segments.includes('components')) return null
    // Module path is the component directory (e.g., [card] from shared/components/card/card.tsx)
    const compIdx = segments.indexOf('components')
    const middle = segments.slice(compIdx + 1, -1)
    return { layer, modulePath: middle }
  }

  if (layer === 'pages') {
    // Flatten: group dirs (auth, dashboard, legal) are organizational
    return { layer, modulePath: [] }
  }

  // features, widgets, entities: include full module path minus "components" segments
  const middle = segments.slice(1, -1).filter(s => s !== 'components')
  return { layer, modulePath: middle }
}

/**
 * Build the data-component attribute value for a specific component variable.
 */
function buildDataComponent(meta: ComponentMeta, varName: string): string {
  const kebab = toKebabCase(varName)

  if (meta.layer === 'pages') {
    return `pages:${kebab}`
  }

  const path = [...meta.modulePath, kebab]

  // Collapse trailing duplicate: [auth, sign-in-form, sign-in-form] → [auth, sign-in-form]
  if (path.length >= 2 && path.at(-1) === path.at(-2)) {
    path.pop()
  }

  return `${meta.layer}:${path.join('/')}`
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

// ============================================================================
// AST Helpers
// ============================================================================

/** Extract variable declarations from a top-level statement */
function getVariableDeclarations(stmt: any): any[] | null {
  if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration?.type === 'VariableDeclaration') {
    return stmt.declaration.declarations
  }
  if (stmt.type === 'VariableDeclaration') {
    return stmt.declarations
  }
  return null
}

/** Get function declaration from export or top-level statement */
function getFunctionDeclaration(stmt: any): any | null {
  if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration?.type === 'FunctionDeclaration') {
    return stmt.declaration
  }
  if (stmt.type === 'FunctionDeclaration') {
    return stmt
  }
  return null
}

/** Unwrap memo(), forwardRef(), React.memo(), React.forwardRef() to the inner function */
function unwrapToFunction(node: any): any {
  if (!node) return null

  if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
    return node
  }

  if (node.type === 'CallExpression') {
    const c = node.callee
    const name =
      c.type === 'Identifier'
        ? c.name
        : c.type === 'MemberExpression' && c.property?.type === 'Identifier'
          ? c.property.name
          : null

    if (name === 'memo' || name === 'forwardRef') {
      return unwrapToFunction(node.arguments[0])
    }
  }

  // TypeScript: expr as Type, expr satisfies Type
  if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') {
    return unwrapToFunction(node.expression)
  }

  return null
}

/** Find all root JSXElement nodes returned by a function */
function findRootJSXElements(fn: any): any[] {
  const results: any[] = []
  const body = fn.body

  // Expression body: () => <div>...</div>
  if (body.type === 'JSXElement') {
    results.push(body)
    return results
  }

  // Block body: () => { ... return <div /> }
  if (body.type === 'BlockStatement') {
    collectReturnJSX(body, results)
  }

  return results
}

/** Recursively find JSX in return statements, skipping nested function scopes */
function collectReturnJSX(node: any, results: any[]): void {
  if (!node || typeof node !== 'object') return

  // Don't descend into nested functions — they are separate components or render helpers
  if (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression' ||
    node.type === 'FunctionDeclaration'
  ) {
    return
  }

  if (node.type === 'ReturnStatement' && node.argument) {
    collectJSXFromExpression(node.argument, results)
    return
  }

  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') continue
    if (key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments') continue

    const val = node[key]
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === 'object' && item.type) {
          collectReturnJSX(item, results)
        }
      }
    } else if (val && typeof val === 'object' && val.type) {
      collectReturnJSX(val, results)
    }
  }
}

/** Extract JSXElements from expressions (handles ternary, logical, parenthesized) */
function collectJSXFromExpression(expr: any, results: any[]): void {
  if (!expr) return

  if (expr.type === 'JSXElement') {
    results.push(expr)
  } else if (expr.type === 'ConditionalExpression') {
    collectJSXFromExpression(expr.consequent, results)
    collectJSXFromExpression(expr.alternate, results)
  } else if (expr.type === 'LogicalExpression') {
    collectJSXFromExpression(expr.right, results)
  }
  // JSXFragment intentionally skipped — can't add attributes to <>...</>
}

/** Check if a JSXElement already has data-component attribute */
function hasDataComponent(jsx: any): boolean {
  return jsx.openingElement.attributes.some(
    (attr: any) =>
      attr.type === 'JSXAttribute' &&
      attr.name?.type === 'JSXIdentifier' &&
      attr.name.name === 'data-component'
  )
}

// ============================================================================
// Plugin
// ============================================================================

export function dataComponent(options: DataComponentOptions = {}): Plugin {
  const { strip = false } = options
  let isProd = false

  return {
    name: 'vite-plugin-data-component',
    enforce: 'pre',

    configResolved(config) {
      isProd = config.isProduction
    },

    transform(code, id) {
      if (isProd && strip) return null

      const meta = resolveComponentMeta(id)
      if (!meta) return null

      // Quick bailout: no JSX in file
      if (!code.includes('<')) return null

      let ast: any
      try {
        ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx']
        })
      } catch {
        return null
      }

      const s = new MagicString(code)
      let changed = false

      for (const stmt of ast.program.body) {
        // Handle: const Foo = () => ... / export const Foo = memo(() => ...)
        const declarations = getVariableDeclarations(stmt)
        if (declarations) {
          for (const decl of declarations) {
            if (decl.id?.type !== 'Identifier') continue

            const fn = unwrapToFunction(decl.init)
            if (!fn) continue

            const jsxElements = findRootJSXElements(fn)
            for (const jsx of jsxElements) {
              if (hasDataComponent(jsx)) continue
              const value = buildDataComponent(meta, decl.id.name)
              s.appendLeft(jsx.openingElement.name.end, ` data-component="${value}"`)
              changed = true
            }
          }
          continue
        }

        // Handle: export function Foo() { ... } / function Foo() { ... }
        const funcDecl = getFunctionDeclaration(stmt)
        if (funcDecl?.id?.type === 'Identifier') {
          const jsxElements = findRootJSXElements(funcDecl)
          for (const jsx of jsxElements) {
            if (hasDataComponent(jsx)) continue
            const value = buildDataComponent(meta, funcDecl.id.name)
            s.appendLeft(jsx.openingElement.name.end, ` data-component="${value}"`)
            changed = true
          }
        }
      }

      if (!changed) return null

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    }
  }
}

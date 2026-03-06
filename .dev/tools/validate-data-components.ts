/**
 * Data Component Audit
 *
 * Dry-run of the vite-plugin-data-component naming logic.
 * Shows which .tsx files get which data-component value.
 *
 * Run: npm run validate:components
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// ============================================================================
// Naming logic (mirrors vite-plugin-data-component.ts)
// ============================================================================

const FSD_LAYERS = new Set(['pages', 'features', 'widgets', 'entities', 'shared'])
const SKIP_DIRS = new Set(['model', 'lib', 'api', 'styles', '__tests__', '__mocks__', 'mocks'])
const SKIP_FILE_RE = /^index$|\.test$|\.spec$|\.stories$/

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

interface FileMeta {
  layer: string
  modulePath: string[]
}

function resolveFileMeta(relative: string): FileMeta | null {
  const segments = relative.split('/')
  const layer = segments[0]

  if (!FSD_LAYERS.has(layer)) return null

  const fileName = segments.at(-1)!.replace(/\.tsx$/, '')
  if (SKIP_FILE_RE.test(fileName)) return null
  if (fileName.includes('.')) return null
  if (segments.some(s => SKIP_DIRS.has(s))) return null

  if (layer === 'shared') {
    if (!segments.includes('components')) return null
    const compIdx = segments.indexOf('components')
    const middle = segments.slice(compIdx + 1, -1)
    return { layer, modulePath: middle }
  }

  if (layer === 'pages') {
    return { layer, modulePath: [] }
  }

  const middle = segments.slice(1, -1).filter(s => s !== 'components')
  return { layer, modulePath: middle }
}

function buildValue(meta: FileMeta, componentName: string): string {
  const kebab = toKebabCase(componentName)

  if (meta.layer === 'pages') {
    return `pages:${kebab}`
  }

  const p = [...meta.modulePath, kebab]
  if (p.length >= 2 && p.at(-1) === p.at(-2)) {
    p.pop()
  }

  return `${meta.layer}:${p.join('/')}`
}

// ============================================================================
// File scanning
// ============================================================================

function walk(dir: string, callback: (filepath: string) => void): void {
  for (const entry of fs.readdirSync(dir)) {
    if (entry.startsWith('.')) continue
    const full = path.join(dir, entry)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'build') continue
      walk(full, callback)
    } else if (full.endsWith('.tsx')) {
      callback(full)
    }
  }
}

/** Extract PascalCase export names from a .tsx file (simple regex, no AST) */
function extractComponentNames(content: string): string[] {
  const names: string[] = []
  const seen = new Set<string>()

  // export const FooBar = ...
  for (const m of content.matchAll(/export\s+const\s+([A-Z][a-zA-Z0-9]*)\s*[=:]/g)) {
    if (!seen.has(m[1])) { seen.add(m[1]); names.push(m[1]) }
  }

  // export function FooBar
  for (const m of content.matchAll(/export\s+function\s+([A-Z][a-zA-Z0-9]*)/g)) {
    if (!seen.has(m[1])) { seen.add(m[1]); names.push(m[1]) }
  }

  // const FooBar = React.forwardRef / memo ... + export { FooBar }
  const localDecls = new Set<string>()
  for (const m of content.matchAll(/^const\s+([A-Z][a-zA-Z0-9]*)\s*=/gm)) {
    localDecls.add(m[1])
  }

  for (const m of content.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const name of m[1].split(',').map(s => s.trim().split(/\s+as\s+/).at(-1)!.trim())) {
      if (localDecls.has(name) && !seen.has(name)) {
        seen.add(name)
        names.push(name)
      }
    }
  }

  return names
}

// ============================================================================
// Main
// ============================================================================

interface AuditEntry {
  file: string
  dataComponent: string
  componentName: string
}

const srcPath = path.join(process.cwd(), 'src')

if (!fs.existsSync(srcPath)) {
  console.error(`Error: ${srcPath} does not exist`)
  process.exit(1)
}

const entries: AuditEntry[] = []
const skipped: string[] = []
const collisions = new Map<string, string[]>()

walk(srcPath, (filepath) => {
  const relative = path.relative(srcPath, filepath).replace(/\\/g, '/')
  const meta = resolveFileMeta(relative)

  if (!meta) {
    skipped.push(relative)
    return
  }

  const content = fs.readFileSync(filepath, 'utf-8')
  const names = extractComponentNames(content)

  if (names.length === 0) {
    skipped.push(relative)
    return
  }

  for (const name of names) {
    const value = buildValue(meta, name)
    entries.push({ file: relative, dataComponent: value, componentName: name })

    const existing = collisions.get(value) || []
    existing.push(`${relative} (${name})`)
    collisions.set(value, existing)
  }
})

// ============================================================================
// Output
// ============================================================================

console.log('='.repeat(72))
console.log('                  DATA-COMPONENT AUDIT REPORT')
console.log('='.repeat(72))
console.log()

// Group by layer
const byLayer = new Map<string, AuditEntry[]>()
for (const entry of entries) {
  const layer = entry.dataComponent.split(':')[0]
  const list = byLayer.get(layer) || []
  list.push(entry)
  byLayer.set(layer, list)
}

for (const [layer, layerEntries] of byLayer) {
  console.log(`  ${layer.toUpperCase()} (${layerEntries.length} components)`)
  console.log('  ' + '-'.repeat(68))

  for (const entry of layerEntries.sort((a, b) => a.dataComponent.localeCompare(b.dataComponent))) {
    const dc = entry.dataComponent.padEnd(50)
    console.log(`    ${dc} ${entry.componentName}`)
  }
  console.log()
}

// Collisions
const dupes = [...collisions.entries()].filter(([, files]) => files.length > 1)
if (dupes.length > 0) {
  console.log('  COLLISIONS DETECTED')
  console.log('  ' + '-'.repeat(68))
  for (const [value, files] of dupes) {
    console.log(`    ${value}:`)
    for (const f of files) {
      console.log(`      - ${f}`)
    }
  }
  console.log()
}

// Summary
console.log('='.repeat(72))
console.log(`  Components tagged:  ${entries.length}`)
console.log(`  Files skipped:      ${skipped.length}`)
console.log(`  Collisions:         ${dupes.length}`)
if (dupes.length > 0) {
  console.log(`  STATUS: COLLISIONS FOUND - review naming`)
} else {
  console.log(`  STATUS: All names unique`)
}
console.log('='.repeat(72))

process.exit(dupes.length > 0 ? 1 : 0)

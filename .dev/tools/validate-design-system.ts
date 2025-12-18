/**
 * Design System Validator v2.0
 *
 * Comprehensive validation for design system consistency across the codebase.
 *
 * Categories:
 * - COLORS: Hardcoded colors, direct Tailwind colors, inline color styles
 * - SIZING: Arbitrary widths, heights, spacing, font sizes, z-index
 * - QUALITY: console.log, TypeScript any, ts-ignore directives
 * - ACCESSIBILITY: focus vs focus-visible, missing aria attributes
 * - FORMS: Field component usage, FormField for react-hook-form
 *
 * Run: npm run validate:design
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// ============================================================================
// Types
// ============================================================================

type Severity = 'error' | 'warning'
type Category = 'colors' | 'sizing' | 'quality' | 'accessibility' | 'forms' | 'patterns'

interface ValidationError {
  file: string
  line: number
  column: number
  rule: string
  category: Category
  message: string
  severity: Severity
  snippet?: string
}

interface ValidationReport {
  errors: ValidationError[]
  warnings: ValidationError[]
  summary: {
    totalFiles: number
    filesWithIssues: number
    totalErrors: number
    totalWarnings: number
    byRule: Record<string, number>
    byCategory: Record<Category, { errors: number; warnings: number }>
  }
}

interface RuleConfig {
  id: string
  category: Category
  description: string
  severity: Severity
  pattern: RegExp
  filePatterns: string[]
  excludePatterns: string[]
  /** Additional validation logic - return false to skip this match */
  validate?: (match: RegExpExecArray, content: string, index: number) => boolean
  message: (match: string) => string
}

// ============================================================================
// Constants
// ============================================================================

// Files/directories to skip entirely
const GLOBAL_EXCLUDES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.dev/tools', // Don't lint the linter itself
  '__mocks__',
  '__tests__',
  '.storybook'
]

// File-specific exclusions (partial path matches)
const FILE_EXCLUDES = [
  'card-utils.ts', // Payment brand colors (Visa, MC)
  'icons/icons.tsx', // SVG country flags (shared/components/icons/)
  'theme-bridge.ts', // Color conversion utilities
  'rating.ts', // Has SSR fallback colors
  'block-color-extension.ts', // Editor highlight colors
  'markdown-editor/lib/theme.ts', // CodeMirror theme (requires !important)
  '.wasm.d.ts', // WASM generated types
  'graph_engine.d.ts' // WASM generated types
]

// Paths where arbitrary sizing is acceptable (UI primitives need flexibility)
const ARBITRARY_SIZING_ALLOWED_PATHS = [
  'shared/components/', // UI kit components
  'app/routes/docs/' // Documentation demos
]

// Tailwind color classes that should use semantic tokens instead
const TAILWIND_COLOR_CLASSES = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone'
]

// ============================================================================
// Rules
// ============================================================================

const rules: RuleConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'no-hex-colors',
    category: 'colors',
    description: 'No hardcoded HEX colors',
    severity: 'error',
    pattern: /#(?:[0-9a-fA-F]{3}){1,2}\b/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.d.ts', '*.test.ts', '*.spec.ts'],
    validate: (match, content, index) => {
      const before = content.slice(Math.max(0, index - 15), index)
      // Skip CSS selectors (e.g., #root)
      if (/id\s*=\s*['"]$/.test(before)) return false
      // Skip URL hashes
      if (/href\s*=\s*['"][^'"]*$/.test(before)) return false
      return true
    },
    message: (match) => `Hardcoded HEX color "${match}" - use CSS variable instead`
  },
  {
    id: 'no-rgb-colors',
    category: 'colors',
    description: 'No hardcoded RGB/RGBA colors',
    severity: 'error',
    pattern: /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.d.ts', '*.test.ts', '*.spec.ts'],
    message: (match) => `Hardcoded RGB color "${match}..." - use CSS variable with oklch() instead`
  },
  {
    id: 'no-hsl-colors',
    category: 'colors',
    description: 'No hardcoded HSL/HSLA colors',
    severity: 'error',
    pattern: /hsla?\s*\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.d.ts', '*.test.ts', '*.spec.ts'],
    message: (match) => `Hardcoded HSL color "${match}..." - use CSS variable with oklch() instead`
  },
  {
    id: 'no-tailwind-color-classes',
    category: 'colors',
    description: 'No direct Tailwind color classes (use semantic tokens)',
    severity: 'warning',
    pattern: new RegExp(
      `(?:bg|text|border|ring|from|to|via|outline|decoration|shadow)-(?:${TAILWIND_COLOR_CLASSES.join('|')})-\\d{2,3}`,
      'g'
    ),
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx', 'ui-showcase-page.tsx', '**/docs/**'],
    message: (match) => `Direct Tailwind color "${match}" - use semantic token (bg-primary, text-foreground, etc.)`
  },
  {
    id: 'no-inline-color-styles',
    category: 'colors',
    description: 'No inline styles with hardcoded colors',
    severity: 'warning',
    pattern: /style\s*=\s*\{\s*\{[^}]*(?:color|background|border)[^}]*['"](?:#[0-9a-fA-F]+|rgba?\s*\(|hsla?\s*\()/gi,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx'],
    message: () => 'Inline style with hardcoded color - use CSS variable or className instead'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SIZING (Arbitrary Values)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'no-arbitrary-width',
    category: 'sizing',
    description: 'No arbitrary width values',
    severity: 'warning',
    pattern: /(?:^|[\s'"])(?:w|min-w|max-w)-\[\d+(?:px|rem|em|%|vh|vw)\]/g,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx'],
    validate: (match, content, index) => {
      // Allow calc() and var() - these are intentional
      if (/\[calc\(|\[var\(/.test(match[0])) return false
      return true
    },
    message: (match) =>
      `Arbitrary width "${match.trim()}" - prefer Tailwind scale (w-64, w-full) or define CSS variable`
  },
  {
    id: 'no-arbitrary-height',
    category: 'sizing',
    description: 'No arbitrary height values',
    severity: 'warning',
    pattern: /(?:^|[\s'"])(?:h|min-h|max-h)-\[\d+(?:px|rem|em|%|vh|vw)\]/g,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx'],
    validate: (match, content, index) => {
      // Allow calc() and var() - these are intentional
      if (/\[calc\(|\[var\(/.test(match[0])) return false
      return true
    },
    message: (match) =>
      `Arbitrary height "${match.trim()}" - prefer Tailwind scale (h-64, h-screen) or define CSS variable`
  },
  {
    id: 'no-arbitrary-spacing',
    category: 'sizing',
    description: 'No arbitrary padding/margin values',
    severity: 'warning',
    pattern: /(?:^|[\s'"])(?:p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|space-x|space-y)-\[\d+(?:px|rem|em)\]/g,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx', '**/shared/components/**'],
    message: (match) => `Arbitrary spacing "${match.trim()}" - prefer Tailwind scale (p-4, gap-2, m-8)`
  },
  {
    id: 'no-arbitrary-font-size',
    category: 'sizing',
    description: 'No arbitrary font size values',
    severity: 'warning',
    pattern: /text-\[\d+(?:px|rem|em)\]/g,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx', '**/shared/components/**'],
    message: (match) => `Arbitrary font size "${match}" - prefer Tailwind scale (text-xs, text-sm, text-base, text-lg)`
  },
  {
    id: 'no-arbitrary-z-index',
    category: 'sizing',
    description: 'No arbitrary z-index values',
    severity: 'warning',
    pattern: /z-\[\d+\]/g,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx', '**/shared/components/**'],
    message: (match) => `Arbitrary z-index "${match}" - prefer Tailwind scale (z-10, z-20, z-30, z-40, z-50)`
  },
  {
    id: 'no-arbitrary-border-radius',
    category: 'sizing',
    description: 'No arbitrary border radius values',
    severity: 'warning',
    pattern: /rounded-\[\d+(?:px|rem|em|%)\]/g,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx', '**/shared/components/**'],
    message: (match) =>
      `Arbitrary border radius "${match}" - prefer Tailwind scale (rounded-sm, rounded-md, rounded-lg)`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CODE QUALITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'no-console-logs',
    category: 'quality',
    description: 'No console.log in production code',
    severity: 'warning',
    pattern: /console\.(log|debug|info)\s*\(/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx', '**/mocks/**'],
    validate: (match, content, index) => {
      // Allow in catch blocks (error logging)
      const before = content.slice(Math.max(0, index - 100), index)
      if (/catch\s*\([^)]*\)\s*\{[^}]*$/.test(before)) return false
      return true
    },
    message: () => 'console.log/debug/info in production code - use proper logger or remove'
  },
  {
    id: 'no-console-warn-error',
    category: 'quality',
    description: 'Prefer structured logging over console.warn/error',
    severity: 'warning',
    pattern: /console\.(warn|error)\s*\(/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
    message: () => 'console.warn/error found - consider using structured logger for better observability'
  },
  {
    id: 'no-typescript-any',
    category: 'quality',
    description: 'No explicit "any" type',
    severity: 'error',
    pattern: /:\s*any\b|as\s+any\b|<any>/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.d.ts', '*.test.ts', '*.test.tsx'],
    message: () => 'Explicit "any" type - use proper type, generic, or "unknown" instead'
  },
  {
    id: 'no-ts-directives',
    category: 'quality',
    description: 'No TypeScript escape hatches',
    severity: 'error',
    pattern: /@ts-ignore|@ts-nocheck|@ts-expect-error/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.d.ts'],
    message: (match) => `TypeScript directive "${match}" - fix the type error instead of suppressing it`
  },
  {
    id: 'no-eslint-disable',
    category: 'quality',
    description: 'No ESLint disable comments',
    severity: 'warning',
    pattern: /eslint-disable(?:-next-line|-line)?(?:\s|$)/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.d.ts', '*.config.*'],
    message: () => 'ESLint disable comment - fix the linting error instead of suppressing it'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESSIBILITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'prefer-focus-visible',
    category: 'accessibility',
    description: 'Prefer focus-visible over focus for keyboard accessibility',
    severity: 'warning',
    pattern: /\bfocus:(?!visible)/g,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx', '**/shared/components/**'],
    validate: (match, content, index) => {
      // Check if focus-visible is also present in nearby context (same className)
      const start = content.lastIndexOf("'", index)
      const end = content.indexOf("'", index + match[0].length)
      if (start !== -1 && end !== -1) {
        const classContent = content.slice(start, end)
        if (classContent.includes('focus-visible:')) return false
      }
      // Same for double quotes
      const startDQ = content.lastIndexOf('"', index)
      const endDQ = content.indexOf('"', index + match[0].length)
      if (startDQ !== -1 && endDQ !== -1) {
        const classContent = content.slice(startDQ, endDQ)
        if (classContent.includes('focus-visible:')) return false
      }
      return true
    },
    message: () => 'Use "focus-visible:" instead of "focus:" for keyboard-only focus styles'
  },
  {
    id: 'button-needs-type',
    category: 'accessibility',
    description: 'Native button elements should have explicit type attribute',
    severity: 'warning',
    // Only match native <button, not <Button (component)
    pattern: /<button(?![^>]*\btype\s*=)[^>]*>/g, // Case-sensitive: <button not <Button
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx', '**/shared/components/button/**'],
    message: () => '<button> without type attribute - add type="button" or type="submit" explicitly'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'use-field-component',
    category: 'forms',
    description: 'Use Field component instead of standalone Label',
    severity: 'warning',
    pattern: /<Label[^>]*>(?:(?!<\/Label>).)*<\/Label>\s*\n\s*<(?:Input|Textarea|Select)/gs,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['**/label.tsx', '**/field.tsx', '**/form.tsx', '*.test.tsx', '**/docs/**'],
    message: () => 'Use <Field> component instead of standalone <Label> + <Input> - provides consistent styling'
  },
  {
    id: 'use-form-field',
    category: 'forms',
    description: 'Use FormField for react-hook-form',
    severity: 'warning',
    pattern: /useForm[^}]*\}[^]*?<Label[^>]*>/gs,
    filePatterns: ['**/*.tsx'],
    excludePatterns: ['**/form.tsx', '*.test.tsx'],
    message: () => 'Forms with useForm() should use <FormField> instead of manual <Label> - provides validation'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PATTERNS (Anti-patterns)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'no-important',
    category: 'patterns',
    description: 'No !important in styles',
    severity: 'warning',
    pattern: /!important/g,
    filePatterns: ['**/*.tsx', '**/*.ts', '**/*.css'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx'],
    validate: (match, content, index) => {
      // Allow in CSS reset / base styles
      const before = content.slice(Math.max(0, index - 200), index)
      if (before.includes('prefers-reduced-motion') || before.includes('@layer base')) return false
      return true
    },
    message: () => '!important found - indicates specificity issue, refactor CSS instead'
  },
  // NOTE: no-nested-ternary removed - handled by ESLint with better accuracy
  // The regex-based approach has too many false positives
  {
    id: 'no-magic-numbers',
    category: 'patterns',
    description: 'No unexplained magic numbers in timeouts',
    severity: 'warning',
    pattern: /setTimeout\s*\([^,]+,\s*\d{4,}\)/g,
    filePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['*.test.tsx', '*.spec.tsx'],
    message: () => 'setTimeout with magic number > 1000ms - extract to named constant for clarity'
  }
]

// ============================================================================
// Helpers
// ============================================================================

const isDirectory = (p: string): boolean => {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

const isFile = (p: string): boolean => {
  try {
    return fs.statSync(p).isFile()
  } catch {
    return false
  }
}

const matchesPattern = (filepath: string, pattern: string): boolean => {
  // Simple glob matching for common patterns
  // Supports: **/*.tsx, *.test.ts, **/mocks/**, etc.

  // Normalize separators
  const normalizedPath = filepath.replace(/\\/g, '/')
  const normalizedPattern = pattern.replace(/\\/g, '/')

  // Build regex step by step
  let regexStr = normalizedPattern
    .split('**')
    .map((part) =>
      part
        .split('*')
        .map((s) => s.replace(/[.+^${}()|[\]\\]/g, '\\$&')) // Escape special chars
        .join('[^/]*') // Single * = anything except /
    )
    .join('.*') // ** = anything including /

  const regex = new RegExp('^' + regexStr + '$')
  return regex.test(normalizedPath)
}

const shouldExcludeFile = (filepath: string, srcPath: string): boolean => {
  const relativePath = path.relative(srcPath, filepath).replace(/\\/g, '/')

  for (const exclude of GLOBAL_EXCLUDES) {
    if (relativePath.includes(exclude)) return true
  }

  for (const exclude of FILE_EXCLUDES) {
    // Support both endsWith and includes for flexibility
    if (relativePath.endsWith(exclude) || relativePath.includes(exclude)) return true
  }

  return false
}

const isInAllowedPath = (relativePath: string, allowedPaths: string[]): boolean => {
  return allowedPaths.some((p) => relativePath.includes(p))
}

const getLineAndColumn = (content: string, index: number): { line: number; column: number } => {
  const lines = content.slice(0, index).split('\n')
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  }
}

const getSnippet = (content: string, index: number, length = 50): string => {
  const start = Math.max(0, index - 20)
  const end = Math.min(content.length, index + length + 20)
  let snippet = content.slice(start, end)

  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet = snippet + '...'

  return snippet.replace(/\n/g, '\\n').trim()
}

const isInComment = (content: string, index: number): boolean => {
  const before = content.slice(0, index)

  // Single-line comment
  const lastNewline = before.lastIndexOf('\n')
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
  const lineContent = before.slice(lineStart)
  if (lineContent.includes('//')) return true

  // Multi-line comment
  const lastCommentStart = before.lastIndexOf('/*')
  const lastCommentEnd = before.lastIndexOf('*/')
  if (lastCommentStart > lastCommentEnd) return true

  return false
}

const isInJSXComment = (content: string, index: number): boolean => {
  const before = content.slice(0, index)
  const lastJSXCommentStart = before.lastIndexOf('{/*')
  const lastJSXCommentEnd = before.lastIndexOf('*/}')
  return lastJSXCommentStart > lastJSXCommentEnd
}

// ============================================================================
// Validation
// ============================================================================

const validateFile = (filepath: string, srcPath: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const relativePath = path.relative(srcPath, filepath).replace(/\\/g, '/')

  let content: string
  try {
    content = fs.readFileSync(filepath, 'utf-8')
  } catch {
    return errors
  }

  for (const rule of rules) {
    // Check if file matches rule patterns
    const matchesFile = rule.filePatterns.some((pattern) => matchesPattern(relativePath, pattern))
    const isExcluded = rule.excludePatterns.some((pattern) => matchesPattern(relativePath, pattern))

    if (!matchesFile || isExcluded) continue

    // Special handling for sizing rules - skip allowed paths
    if (rule.category === 'sizing' && isInAllowedPath(relativePath, ARBITRARY_SIZING_ALLOWED_PATHS)) {
      continue
    }

    // Reset regex lastIndex
    rule.pattern.lastIndex = 0

    let match: RegExpExecArray | null
    while ((match = rule.pattern.exec(content)) !== null) {
      const index = match.index

      // Skip matches in comments
      if (isInComment(content, index)) continue
      if (isInJSXComment(content, index)) continue

      // Run custom validation if provided
      if (rule.validate && !rule.validate(match, content, index)) continue

      const { line, column } = getLineAndColumn(content, index)

      errors.push({
        file: relativePath,
        line,
        column,
        rule: rule.id,
        category: rule.category,
        message: rule.message(match[0]),
        severity: rule.severity,
        snippet: getSnippet(content, index)
      })
    }
  }

  return errors
}

const walkDirectory = (dir: string, callback: (filepath: string) => void): void => {
  try {
    const entries = fs.readdirSync(dir)

    for (const entry of entries) {
      if (entry.startsWith('.')) continue

      const fullPath = path.join(dir, entry)

      if (isDirectory(fullPath)) {
        if (GLOBAL_EXCLUDES.some((exclude) => entry === exclude || fullPath.includes(exclude))) {
          continue
        }
        walkDirectory(fullPath, callback)
      } else if (isFile(fullPath)) {
        callback(fullPath)
      }
    }
  } catch {
    // Ignore read errors
  }
}

const validateDesignSystem = (srcPath: string): ValidationReport => {
  const report: ValidationReport = {
    errors: [],
    warnings: [],
    summary: {
      totalFiles: 0,
      filesWithIssues: 0,
      totalErrors: 0,
      totalWarnings: 0,
      byRule: {},
      byCategory: {
        colors: { errors: 0, warnings: 0 },
        sizing: { errors: 0, warnings: 0 },
        quality: { errors: 0, warnings: 0 },
        accessibility: { errors: 0, warnings: 0 },
        forms: { errors: 0, warnings: 0 },
        patterns: { errors: 0, warnings: 0 }
      }
    }
  }

  const filesWithIssues = new Set<string>()

  walkDirectory(srcPath, (filepath) => {
    if (shouldExcludeFile(filepath, srcPath)) return
    if (!filepath.endsWith('.ts') && !filepath.endsWith('.tsx') && !filepath.endsWith('.css')) return

    report.summary.totalFiles++

    const fileErrors = validateFile(filepath, srcPath)

    for (const error of fileErrors) {
      if (error.severity === 'error') {
        report.errors.push(error)
        report.summary.totalErrors++
        report.summary.byCategory[error.category].errors++
      } else {
        report.warnings.push(error)
        report.summary.totalWarnings++
        report.summary.byCategory[error.category].warnings++
      }

      filesWithIssues.add(error.file)
      report.summary.byRule[error.rule] = (report.summary.byRule[error.rule] || 0) + 1
    }
  })

  report.summary.filesWithIssues = filesWithIssues.size

  return report
}

// ============================================================================
// Output
// ============================================================================

const CATEGORY_LABELS: Record<Category, string> = {
  colors: 'Colors',
  sizing: 'Sizing & Layout',
  quality: 'Code Quality',
  accessibility: 'Accessibility',
  forms: 'Forms',
  patterns: 'Patterns'
}

const CATEGORY_ICONS: Record<Category, string> = {
  colors: '🎨',
  sizing: '📐',
  quality: '🔧',
  accessibility: '♿',
  forms: '📝',
  patterns: '🧩'
}

const formatReport = (report: ValidationReport): string => {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════════════════════════')
  lines.push('                    DESIGN SYSTEM VALIDATION REPORT')
  lines.push('═══════════════════════════════════════════════════════════════════════')
  lines.push('')

  // Summary
  lines.push('┌───────────────────────────────────────────────────────────────────────┐')
  lines.push('│                              SUMMARY                                  │')
  lines.push('├───────────────────────────────────────────────────────────────────────┤')
  lines.push(
    `│  Files scanned:     ${report.summary.totalFiles.toString().padEnd(8)} │  Files with issues:  ${report.summary.filesWithIssues.toString().padEnd(8)} │`
  )
  lines.push(
    `│  Errors:            ${report.summary.totalErrors.toString().padEnd(8)} │  Warnings:           ${report.summary.totalWarnings.toString().padEnd(8)} │`
  )
  lines.push('└───────────────────────────────────────────────────────────────────────┘')
  lines.push('')

  // By category
  const hasIssues = report.summary.totalErrors > 0 || report.summary.totalWarnings > 0
  if (hasIssues) {
    lines.push('┌───────────────────────────────────────────────────────────────────────┐')
    lines.push('│                            BY CATEGORY                                │')
    lines.push('├───────────────────────────────────────────────────────────────────────┤')

    for (const [cat, stats] of Object.entries(report.summary.byCategory)) {
      const category = cat as Category
      if (stats.errors === 0 && stats.warnings === 0) continue
      const icon = CATEGORY_ICONS[category]
      const label = CATEGORY_LABELS[category]
      const total = stats.errors + stats.warnings
      const errStr = stats.errors > 0 ? `${stats.errors}E` : ''
      const warnStr = stats.warnings > 0 ? `${stats.warnings}W` : ''
      const details = [errStr, warnStr].filter(Boolean).join(' ')
      lines.push(`│  ${icon} ${label.padEnd(20)} ${total.toString().padStart(4)} issues (${details.padEnd(10)})   │`)
    }

    lines.push('└───────────────────────────────────────────────────────────────────────┘')
    lines.push('')

    // By rule (top 10)
    lines.push('┌───────────────────────────────────────────────────────────────────────┐')
    lines.push('│                         TOP ISSUES BY RULE                            │')
    lines.push('├───────────────────────────────────────────────────────────────────────┤')

    const sortedRules = Object.entries(report.summary.byRule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    for (const [ruleId, count] of sortedRules) {
      const ruleConfig = rules.find((r) => r.id === ruleId)
      const severity = ruleConfig?.severity === 'error' ? 'E' : 'W'
      lines.push(`│  [${severity}] ${ruleId.padEnd(30)} ${count.toString().padStart(5)} │`)
    }

    lines.push('└───────────────────────────────────────────────────────────────────────┘')
    lines.push('')
  }

  // Errors (detailed)
  if (report.errors.length > 0) {
    lines.push('┌───────────────────────────────────────────────────────────────────────┐')
    lines.push('│                              ERRORS                                   │')
    lines.push('└───────────────────────────────────────────────────────────────────────┘')

    const byFile = new Map<string, ValidationError[]>()
    for (const error of report.errors) {
      const existing = byFile.get(error.file) || []
      existing.push(error)
      byFile.set(error.file, existing)
    }

    for (const [file, errors] of byFile) {
      lines.push('')
      lines.push(`  📄 ${file}`)
      for (const error of errors.slice(0, 5)) {
        lines.push(`     L${error.line}:${error.column} [${error.rule}]`)
        lines.push(`     ${error.message}`)
        if (error.snippet) {
          lines.push(`     │ ${error.snippet}`)
        }
      }
      if (errors.length > 5) {
        lines.push(`     ... and ${errors.length - 5} more`)
      }
    }
    lines.push('')
  }

  // Warnings (abbreviated by rule)
  if (report.warnings.length > 0) {
    lines.push('┌───────────────────────────────────────────────────────────────────────┐')
    lines.push('│                             WARNINGS                                  │')
    lines.push('└───────────────────────────────────────────────────────────────────────┘')

    const byRule = new Map<string, ValidationError[]>()
    for (const warning of report.warnings) {
      const existing = byRule.get(warning.rule) || []
      existing.push(warning)
      byRule.set(warning.rule, existing)
    }

    for (const [rule, warnings] of byRule) {
      lines.push('')
      lines.push(`  ⚠️  ${rule} (${warnings.length} occurrences)`)
      for (const warning of warnings.slice(0, 3)) {
        lines.push(`     ${warning.file}:${warning.line}`)
      }
      if (warnings.length > 3) {
        lines.push(`     ... and ${warnings.length - 3} more`)
      }
    }
    lines.push('')
  }

  // Final status
  lines.push('═══════════════════════════════════════════════════════════════════════')

  if (report.summary.totalErrors === 0 && report.summary.totalWarnings === 0) {
    lines.push('  ✅ Design system is consistent!')
  } else if (report.summary.totalErrors === 0) {
    lines.push(`  ⚠️  No errors, but ${report.summary.totalWarnings} warnings to review`)
  } else {
    lines.push(`  ❌ Found ${report.summary.totalErrors} errors and ${report.summary.totalWarnings} warnings`)
  }

  lines.push('═══════════════════════════════════════════════════════════════════════')
  lines.push('')

  // Rules reference
  lines.push('Rules reference:')
  const categories = [...new Set(rules.map((r) => r.category))]
  for (const cat of categories) {
    lines.push(`  ${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}:`)
    for (const rule of rules.filter((r) => r.category === cat)) {
      const severity = rule.severity === 'error' ? 'E' : 'W'
      lines.push(`    [${severity}] ${rule.id}`)
    }
  }

  return lines.join('\n')
}

// ============================================================================
// CLI
// ============================================================================

const main = () => {
  const srcPath = process.argv[2] || path.join(process.cwd(), 'src')

  // Also scan app/ directory for routes
  const appPath = path.join(process.cwd(), 'app')

  if (!isDirectory(srcPath)) {
    console.error(`Error: ${srcPath} is not a directory`)
    process.exit(1)
  }

  console.log(`Validating design system in: ${srcPath}`)
  if (isDirectory(appPath)) {
    console.log(`Also scanning: ${appPath}`)
  }
  console.log('')

  const report = validateDesignSystem(srcPath)

  // Also validate app/ if it exists
  if (isDirectory(appPath)) {
    const appReport = validateDesignSystem(appPath)
    report.errors.push(...appReport.errors)
    report.warnings.push(...appReport.warnings)
    report.summary.totalFiles += appReport.summary.totalFiles
    report.summary.filesWithIssues += appReport.summary.filesWithIssues
    report.summary.totalErrors += appReport.summary.totalErrors
    report.summary.totalWarnings += appReport.summary.totalWarnings
    for (const [rule, count] of Object.entries(appReport.summary.byRule)) {
      report.summary.byRule[rule] = (report.summary.byRule[rule] || 0) + count
    }
    for (const [cat, stats] of Object.entries(appReport.summary.byCategory)) {
      const category = cat as Category
      report.summary.byCategory[category].errors += stats.errors
      report.summary.byCategory[category].warnings += stats.warnings
    }
  }

  console.log(formatReport(report))

  // Exit with error code if there are errors
  process.exit(report.summary.totalErrors > 0 ? 1 : 0)
}

main()

/**
 * i18n Validator
 *
 * Validates translation files against the reference locale (EN).
 * Detects missing keys, extra keys, structural mismatches, empty values,
 * placeholder mismatches, and duplicate values that belong in `common`.
 *
 * Reference locale: EN (source of truth)
 * Target locales: everything else in public/locales/
 *
 * Run: npx tsx .dev/tools/validate-i18n.ts
 *
 * IMPORTANT: This tool is read-only. It reports problems but never
 * modifies or deletes translation files. All fixes must be done manually.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================================
// Types
// ============================================================================

type Severity = 'error' | 'warning' | 'info'
type Category =
  | 'missing_key'
  | 'extra_key'
  | 'empty_value'
  | 'placeholder_mismatch'
  | 'type_mismatch'
  | 'duplicate_value'
  | 'common_candidate'

interface Issue {
  locale: string
  key: string
  category: Category
  severity: Severity
  message: string
  refValue?: string
  localeValue?: string
}

interface LocaleReport {
  locale: string
  totalKeys: number
  missingKeys: number
  extraKeys: number
  emptyValues: number
  placeholderMismatches: number
  typeMismatches: number
  coverage: number
}

interface Report {
  referenceLocale: string
  referenceKeyCount: number
  locales: LocaleReport[]
  issues: Issue[]
  commonCandidates: Array<{ value: string; keys: string[]; count: number }>
}

// ============================================================================
// JSON helpers
// ============================================================================

function flattenJson(obj: unknown, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return result
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      result[fullKey] = v
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.assign(result, flattenJson(v, fullKey))
    }
  }
  return result
}

/** Get the structural shape of JSON (keys → 'string' | 'object') */
function getStructure(obj: unknown, prefix = ''): Record<string, 'string' | 'object'> {
  const result: Record<string, 'string' | 'object'> = {}
  if (typeof obj !== 'object' || obj === null) {
    return result
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      result[fullKey] = 'string'
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      result[fullKey] = 'object'
      Object.assign(result, getStructure(v, fullKey))
    }
  }
  return result
}

/** Extract {{placeholders}} from a translation value */
function extractPlaceholders(value: string): string[] {
  const matches = value.match(/\{\{[^}]+\}\}/g)
  return matches ? matches.sort() : []
}

// ============================================================================
// Analysis
// ============================================================================

function analyze(): Report {
  const localesDir = path.resolve(__dirname, '../../public/locales')
  const allLocales = fs.readdirSync(localesDir).filter(d =>
    fs.statSync(path.join(localesDir, d)).isDirectory()
  )

  const refLocale = 'en'
  const targetLocales = allLocales.filter(l => l !== refLocale)

  // Load reference
  const refPath = path.join(localesDir, refLocale, 'translation.json')
  const refJson = JSON.parse(fs.readFileSync(refPath, 'utf-8'))
  const refFlat = flattenJson(refJson)
  const refStructure = getStructure(refJson)
  const refKeys = new Set(Object.keys(refFlat))

  const issues: Issue[] = []
  const localeReports: LocaleReport[] = []

  for (const locale of targetLocales) {
    const localePath = path.join(localesDir, locale, 'translation.json')
    if (!fs.existsSync(localePath)) {
      issues.push({
        locale,
        key: '',
        category: 'missing_key',
        severity: 'error',
        message: `Translation file not found: ${locale}/translation.json`,
      })
      continue
    }

    const localeJson = JSON.parse(fs.readFileSync(localePath, 'utf-8'))
    const localeFlat = flattenJson(localeJson)
    const localeStructure = getStructure(localeJson)
    const localeKeys = new Set(Object.keys(localeFlat))

    let missingKeys = 0
    let extraKeys = 0
    let emptyValues = 0
    let placeholderMismatches = 0
    let typeMismatches = 0

    // 1. Missing keys (in ref, not in locale)
    for (const key of refKeys) {
      if (!localeKeys.has(key)) {
        missingKeys++
        issues.push({
          locale,
          key,
          category: 'missing_key',
          severity: 'error',
          message: `Missing translation`,
          refValue: refFlat[key],
        })
      }
    }

    // 2. Extra keys (in locale, not in ref)
    // i18next plural suffixes that are language-specific (not in EN but valid in other locales)
    const pluralSuffixes = ['_zero', '_one', '_two', '_few', '_many', '_other']
    for (const key of localeKeys) {
      if (!refKeys.has(key)) {
        // Check if this is a valid plural form: base key (without suffix) exists in ref
        const isPluralVariant = pluralSuffixes.some(suffix => {
          if (!key.endsWith(suffix)) {
            return false
          }
          const baseKey = key.slice(0, -suffix.length)
          return refKeys.has(baseKey) || refKeys.has(`${baseKey}_one`) || refKeys.has(`${baseKey}_other`)
        })
        if (isPluralVariant) {
          continue // Valid plural form for this locale, not an issue
        }

        extraKeys++
        issues.push({
          locale,
          key,
          category: 'extra_key',
          severity: 'warning',
          message: `Key not in reference locale (${refLocale})`,
          localeValue: localeFlat[key],
        })
      }
    }

    // 3. Empty values
    for (const key of localeKeys) {
      if (localeFlat[key] !== undefined && localeFlat[key].trim() === '') {
        emptyValues++
        issues.push({
          locale,
          key,
          category: 'empty_value',
          severity: 'error',
          message: `Empty translation value`,
          refValue: refFlat[key],
        })
      }
    }

    // 4. Placeholder mismatches
    for (const key of localeKeys) {
      if (!refKeys.has(key)) {
        continue
      }
      const refPlaceholders = extractPlaceholders(refFlat[key])
      const localePlaceholders = extractPlaceholders(localeFlat[key])

      if (JSON.stringify(refPlaceholders) !== JSON.stringify(localePlaceholders)) {
        placeholderMismatches++
        issues.push({
          locale,
          key,
          category: 'placeholder_mismatch',
          severity: 'error',
          message: `Placeholder mismatch: ref has [${refPlaceholders.join(', ')}], locale has [${localePlaceholders.join(', ')}]`,
          refValue: refFlat[key],
          localeValue: localeFlat[key],
        })
      }
    }

    // 5. Type mismatches (string in ref but object in locale, or vice versa)
    for (const key of Object.keys(refStructure)) {
      if (localeStructure[key] && refStructure[key] !== localeStructure[key]) {
        typeMismatches++
        issues.push({
          locale,
          key,
          category: 'type_mismatch',
          severity: 'error',
          message: `Type mismatch: ref is ${refStructure[key]}, locale is ${localeStructure[key]}`,
        })
      }
    }

    const coverage = refKeys.size > 0 ? ((refKeys.size - missingKeys) / refKeys.size) * 100 : 100

    localeReports.push({
      locale,
      totalKeys: localeKeys.size,
      missingKeys,
      extraKeys,
      emptyValues,
      placeholderMismatches,
      typeMismatches,
      coverage,
    })
  }

  // 6. Common candidates — duplicate values across 3+ domains in reference locale
  const commonCandidates = findCommonCandidates(refFlat)

  return {
    referenceLocale: refLocale,
    referenceKeyCount: refKeys.size,
    locales: localeReports,
    issues,
    commonCandidates,
  }
}

/** Find values duplicated across 3+ top-level domains (candidates for common.*) */
function findCommonCandidates(flat: Record<string, string>): Report['commonCandidates'] {
  const valueToDomains = new Map<string, { keys: string[]; domains: Set<string> }>()

  for (const [key, value] of Object.entries(flat)) {
    const normalized = value.toLowerCase().trim()
    // Only single words or 2-word phrases (safe to share)
    const wordCount = normalized.split(/\s+/).length
    if (wordCount > 3 || normalized.length < 2 || normalized.length > 30) {
      continue
    }
    // Skip if already in common
    if (key.startsWith('common.')) {
      continue
    }
    // Skip template values
    if (/\{\{/.test(value)) {
      continue
    }

    const domain = key.split('.')[0]

    if (!valueToDomains.has(normalized)) {
      valueToDomains.set(normalized, { keys: [], domains: new Set() })
    }
    const entry = valueToDomains.get(normalized)!
    entry.keys.push(key)
    entry.domains.add(domain)
  }

  return Array.from(valueToDomains.entries())
    .filter(([, data]) => data.domains.size >= 3)
    .map(([value, data]) => ({
      value,
      keys: data.keys,
      count: data.keys.length,
    }))
    .sort((a, b) => b.count - a.count)
}

// ============================================================================
// Output
// ============================================================================

function printReport(report: Report) {
  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║              i18n Validator — Report                    ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  console.log(`  Reference locale: ${report.referenceLocale.toUpperCase()} (${report.referenceKeyCount} keys)\n`)

  // Per-locale summary
  console.log('  ─── Coverage ───\n')
  for (const loc of report.locales) {
    const bar = (pct: number) => {
      const filled = Math.round(pct / 2.5)
      return '█'.repeat(filled) + '░'.repeat(40 - filled)
    }
    console.log(`  ${loc.locale.toUpperCase()}  ${bar(loc.coverage)}  ${loc.coverage.toFixed(1)}%  (${loc.totalKeys} keys)`)
    const problems: string[] = []
    if (loc.missingKeys > 0) { problems.push(`${loc.missingKeys} missing`) }
    if (loc.extraKeys > 0) { problems.push(`${loc.extraKeys} extra`) }
    if (loc.emptyValues > 0) { problems.push(`${loc.emptyValues} empty`) }
    if (loc.placeholderMismatches > 0) { problems.push(`${loc.placeholderMismatches} placeholder mismatches`) }
    if (loc.typeMismatches > 0) { problems.push(`${loc.typeMismatches} type mismatches`) }
    if (problems.length > 0) {
      console.log(`       ${problems.join(', ')}`)
    }
    console.log()
  }

  // Issues by category
  const byCategory = new Map<Category, Issue[]>()
  for (const issue of report.issues) {
    if (!byCategory.has(issue.category)) {
      byCategory.set(issue.category, [])
    }
    byCategory.get(issue.category)!.push(issue)
  }

  const categoryOrder: Category[] = [
    'missing_key',
    'extra_key',
    'empty_value',
    'placeholder_mismatch',
    'type_mismatch',
  ]

  const categoryLabels: Record<Category, string> = {
    missing_key: 'Missing keys',
    extra_key: 'Extra keys',
    empty_value: 'Empty values',
    placeholder_mismatch: 'Placeholder mismatches',
    type_mismatch: 'Type mismatches',
    duplicate_value: 'Duplicate values',
    common_candidate: 'Common candidates',
  }

  for (const cat of categoryOrder) {
    const catIssues = byCategory.get(cat)
    if (!catIssues || catIssues.length === 0) {
      continue
    }

    console.log(`  ─── ${categoryLabels[cat]} (${catIssues.length}) ───\n`)

    // Group by locale
    const byLocale = new Map<string, Issue[]>()
    for (const issue of catIssues) {
      if (!byLocale.has(issue.locale)) {
        byLocale.set(issue.locale, [])
      }
      byLocale.get(issue.locale)!.push(issue)
    }

    for (const [locale, locIssues] of byLocale) {
      console.log(`    [${locale.toUpperCase()}] ${locIssues.length} issues:`)
      const shown = locIssues.slice(0, 15)
      for (const issue of shown) {
        if (cat === 'placeholder_mismatch') {
          console.log(`      ${issue.key}`)
          console.log(`        ref: "${truncate(issue.refValue ?? '', 60)}"`)
          console.log(`        ${locale}: "${truncate(issue.localeValue ?? '', 60)}"`)
        } else if (cat === 'extra_key') {
          console.log(`      ${issue.key} = "${truncate(issue.localeValue ?? '', 50)}"`)
        } else if (cat === 'missing_key') {
          console.log(`      ${issue.key}`)
        } else {
          console.log(`      ${issue.key}: ${issue.message}`)
        }
      }
      if (locIssues.length > 15) {
        console.log(`      ... and ${locIssues.length - 15} more`)
      }
      console.log()
    }
  }

  // Common candidates
  if (report.commonCandidates.length > 0) {
    console.log(`  ─── Common candidates (${report.commonCandidates.length} values duplicated across 3+ domains) ───\n`)
    const shown = report.commonCandidates.slice(0, 20)
    for (const candidate of shown) {
      console.log(`    ${candidate.count}x  "${candidate.value}"`)
      for (const key of candidate.keys.slice(0, 5)) {
        console.log(`         ${key}`)
      }
      if (candidate.keys.length > 5) {
        console.log(`         ... and ${candidate.keys.length - 5} more`)
      }
      console.log()
    }
    if (report.commonCandidates.length > 20) {
      console.log(`    ... and ${report.commonCandidates.length - 20} more candidates\n`)
    }
  }

  // Final summary
  const totalErrors = report.issues.filter(i => i.severity === 'error').length
  const totalWarnings = report.issues.filter(i => i.severity === 'warning').length

  console.log('  ─── Summary ───\n')
  console.log(`    ${totalErrors} errors, ${totalWarnings} warnings`)
  console.log(`    ${report.commonCandidates.length} values could move to common.*\n`)

  if (totalErrors > 0) {
    process.exitCode = 1
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}...` : s
}

// ============================================================================
// Run
// ============================================================================

const report = analyze()
printReport(report)

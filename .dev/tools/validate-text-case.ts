/**
 * Text Case Validator
 *
 * Analyzes all translation files for capitalization consistency.
 * Convention: sentence case everywhere (see .dev/docs/design/text-case-convention.md)
 *
 * Categories:
 * - UPPER_CASE:  "SIGN IN"          — all caps
 * - Title_Case:  "Sign In"          — each word capitalized
 * - Sentence:    "Sign in"          — only first word capitalized
 * - lower_case:  "sign in"          — all lowercase
 * - Mixed:       other patterns
 *
 * Run: npx tsx .dev/tools/validate-text-case.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================================
// Types
// ============================================================================

type TextCase = 'UPPER_CASE' | 'Title_Case' | 'Sentence' | 'lower_case' | 'Mixed'

interface TextEntry {
  key: string
  value: string
  locale: string
  case: TextCase
  violation: boolean
  reason: string | null
}

interface Report {
  entries: TextEntry[]
  stats: Record<TextCase, number>
  violations: TextEntry[]
  totalKeys: number
  byLocale: Record<string, { total: number; stats: Record<TextCase, number>; violations: number }>
}

// ============================================================================
// Skip & Allow lists
// ============================================================================

/** Values to skip entirely (not classifiable UI text) */
const SKIP_VALUE_PATTERNS = [
  /^\{\{.*\}\}$/,                     // template-only: "{{seconds}}s"
  /^[a-z]+@[a-z]+\.[a-z]+$/,         // emails
  /^https?:\/\//,                     // URLs
  /^\d+$/,                            // numbers only
  /^[^a-zA-Zа-яА-ЯёЁ]*$/,           // no letters at all
  /^[A-Z]{1,5}$/,                     // short acronyms: "ELO", "API"
  /^[А-ЯЁ]{1,5}$/,                   // Russian short acronyms: "ММ", "ГГГГ"
  /^X{3,}$/,                          // placeholder masks: "XXXXXXXX"
  /^GitHub$|^Telegram$|^Neylin$|^Google$|^Apple$|^Glicko-2$/, // proper nouns
]

/** Keys to skip entirely (technical, not user-facing text) */
const SKIP_KEY_PATTERNS = [
  /\.name$/,                           // cookie/config names: "neylin-lang"
  /placeholder.*month|placeholder.*year/i, // date format placeholders
  /backupPlaceholder/i,                // "XXXXXXXX"
  /legal\.license/i,                   // MIT license text (legal standard)
  /legal\.cookies.*\.table\./i,        // cookie table technical values
]

/** Crypto tickers, network names — always uppercase, not a violation */
const CRYPTO_PATTERN = /^[A-Z]{2,6}(?:[,-]\s*[A-Z]{2,6})*$|^(?:BTC|ETH|USDT|USDC|SOL|TRC|ERC|BEP)-?\d*(?:\s|,)/

/** Values starting with {{var}} — these are fragments, lowercase is expected */
const TEMPLATE_START = /^\{\{/

/** Keys where lowercase is expected by design */
const LOWERCASE_ALLOWED_KEYS = [
  /placeholder/i,
  /orDivider/i,
  /\.and$/,
  /edgeTypes\./,                       // "prerequisite", "contradicts" — domain terms
  /timeAgo\./,                         // "{{count}} min ago" — fragments
  /announcements\./i,                  // "{{block}} inserted" — fragments
  /\.saved$/,                          // "{{count}} items saved"
  /Count$/,                            // "{{count}} nodes", "{{count}} connections"
  /\.remaining/,                       // "{{count}} codes remaining"
  /walletAdded/,                       // "{{network}} wallet added"
  /crypto\.networks.*Description/,     // "TRC-20 USDT" — handled by crypto pattern
]

/** Words that are always uppercase (acronyms) */
const ALWAYS_UPPER = new Set([
  'api', 'ai', 'id', 'url', 'elo', 'faq', 'css', 'html', 'json', 'http',
  'https', 'oauth', 'jwt', 'qr', 'ui', 'ux', 'svg', 'pdf', 'usb', 'ton',
  'usd', 'eur', 'rub', 'ip', 'dns', 'ssl', 'tls', '2fa', 'otp', 'sso',
  'ssr', 'cdn', 'btc', 'eth', 'usdt', 'usdc', 'sol',
])

/** Short English words that stay lowercase in Title Case */
const SHORT_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'is', 'are', 'was', 'be', 'not', 'no', 'so',
  'as', 'if', 'up', 'do', 'it', 'my', 'we', 'he',
])

// ============================================================================
// Classification
// ============================================================================

function extractWords(text: string): string[] {
  return text
    .replace(/\{\{.*?\}\}/g, '')                   // remove {{vars}}
    .replace(/[^a-zA-Zа-яА-ЯёЁ\s'-]/g, ' ')      // keep letters, spaces, hyphens, apostrophes
    .split(/\s+/)
    .filter(w => w.length > 0)
}

function isUpperChar(ch: string): boolean {
  return ch !== ch.toLowerCase() && ch === ch.toUpperCase()
}

function isLetter(ch: string): boolean {
  return ch.toLowerCase() !== ch.toUpperCase()
}

function classifyCase(text: string): TextCase {
  const cleaned = text.trim()
  if (!cleaned) {
    return 'Mixed'
  }

  const words = extractWords(cleaned)
  if (words.length === 0) {
    return 'Mixed'
  }

  // All uppercase (2+ letter words)
  const letterWords = words.filter(w => isLetter(w[0]))
  if (letterWords.length === 0) {
    return 'Mixed'
  }

  const allUpper = letterWords.every(w => w === w.toUpperCase())
  if (allUpper && letterWords.some(w => w.length > 1)) {
    return 'UPPER_CASE'
  }

  // All lowercase
  const allLower = letterWords.every(w => w === w.toLowerCase())
  if (allLower) {
    return 'lower_case'
  }

  // Single word
  if (letterWords.length === 1) {
    const w = letterWords[0]
    if (isUpperChar(w[0]) && (w.length === 1 || w.slice(1) === w.slice(1).toLowerCase())) {
      return 'Sentence'
    }
    return 'Mixed'
  }

  // Multi-word: check if Title Case
  // Title Case = most content words start with uppercase
  const contentWords = letterWords.filter((w, i) => {
    if (ALWAYS_UPPER.has(w.toLowerCase())) { return false }  // skip acronyms
    if (i > 0 && SHORT_WORDS.has(w.toLowerCase())) { return false } // skip prepositions
    return true
  })

  const upperStartCount = contentWords.filter(w => isUpperChar(w[0])).length
  const isTitleCase = contentWords.length >= 2 && upperStartCount === contentWords.length

  if (isTitleCase) {
    // Verify: does second+ content word start with uppercase?
    const nonFirstContent = contentWords.slice(1)
    const hasUpperNonFirst = nonFirstContent.some(w => isUpperChar(w[0]))
    if (hasUpperNonFirst) {
      return 'Title_Case'
    }
  }

  // Sentence case: first letter-word uppercase, rest lowercase (or acronyms)
  const first = letterWords[0]
  const firstIsUpper = isUpperChar(first[0])
  const restOk = letterWords.slice(1).every(w => {
    if (ALWAYS_UPPER.has(w.toLowerCase())) { return true }
    if (w === w.toUpperCase() && w.length <= 4) { return true } // short acronyms
    return w[0] === w[0].toLowerCase()
  })

  if (firstIsUpper && restOk) {
    return 'Sentence'
  }

  return 'Mixed'
}

// ============================================================================
// Skip & Violation logic
// ============================================================================

function shouldSkip(key: string, value: string): boolean {
  if (typeof value !== 'string' || value.length <= 1) {
    return true
  }
  if (SKIP_KEY_PATTERNS.some(p => p.test(key))) {
    return true
  }
  if (SKIP_VALUE_PATTERNS.some(p => p.test(value))) {
    return true
  }
  if (CRYPTO_PATTERN.test(value)) {
    return true
  }
  return false
}

function checkViolation(entry: TextEntry): { violation: boolean; reason: string | null } {
  const { key, value } = entry
  const textCase = entry.case

  // Mixed — can't classify, skip
  if (textCase === 'Mixed') {
    return { violation: false, reason: null }
  }

  // UPPER_CASE — always violation
  if (textCase === 'UPPER_CASE') {
    return { violation: true, reason: 'Uppercase — should be sentence case' }
  }

  // Title_Case — always violation
  if (textCase === 'Title_Case') {
    return { violation: true, reason: 'Title Case — should be sentence case' }
  }

  // lower_case — check if allowed
  if (textCase === 'lower_case') {
    // Template-start values: "{{count}} nodes" — lowercase is expected
    if (TEMPLATE_START.test(value)) {
      return { violation: false, reason: null }
    }
    // Allowed key patterns
    if (LOWERCASE_ALLOWED_KEYS.some(p => p.test(key))) {
      return { violation: false, reason: null }
    }
    // Very short labels: "or", "and", "via"
    if (value.trim().length <= 6) {
      return { violation: false, reason: null }
    }
    return { violation: true, reason: 'Lowercase — should start with capital (sentence case)' }
  }

  // Sentence — correct
  return { violation: false, reason: null }
}

// ============================================================================
// JSON traversal
// ============================================================================

function flattenJson(obj: Record<string, unknown>, prefix = ''): Array<{ key: string; value: string }> {
  const result: Array<{ key: string; value: string }> = []
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      result.push({ key: fullKey, value: v })
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      result.push(...flattenJson(v as Record<string, unknown>, fullKey))
    }
  }
  return result
}

// ============================================================================
// Main
// ============================================================================

function analyze(): Report {
  const localesDir = path.resolve(__dirname, '../../public/locales')
  const locales = fs.readdirSync(localesDir).filter(d =>
    fs.statSync(path.join(localesDir, d)).isDirectory()
  )

  const entries: TextEntry[] = []

  for (const locale of locales) {
    const filePath = path.join(localesDir, locale, 'translation.json')
    if (!fs.existsSync(filePath)) {
      continue
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const flat = flattenJson(content)

    for (const { key, value } of flat) {
      if (shouldSkip(key, value)) {
        continue
      }

      const textCase = classifyCase(value)
      const entry: TextEntry = { key, value, locale, case: textCase, violation: false, reason: null }
      const check = checkViolation(entry)
      entry.violation = check.violation
      entry.reason = check.reason
      entries.push(entry)
    }
  }

  // Stats
  const stats: Record<TextCase, number> = { UPPER_CASE: 0, Title_Case: 0, Sentence: 0, lower_case: 0, Mixed: 0 }
  const byLocale: Report['byLocale'] = {}

  for (const entry of entries) {
    stats[entry.case]++
    if (!byLocale[entry.locale]) {
      byLocale[entry.locale] = {
        total: 0,
        stats: { UPPER_CASE: 0, Title_Case: 0, Sentence: 0, lower_case: 0, Mixed: 0 },
        violations: 0,
      }
    }
    byLocale[entry.locale].total++
    byLocale[entry.locale].stats[entry.case]++
    if (entry.violation) {
      byLocale[entry.locale].violations++
    }
  }

  return { entries, stats, violations: entries.filter(e => e.violation), totalKeys: entries.length, byLocale }
}

// ============================================================================
// Output
// ============================================================================

function printReport(report: Report) {
  const { stats, violations, totalKeys, byLocale } = report

  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║           Text Case Validator — Report                  ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  // Distribution bar
  const bar = (count: number, total: number) => {
    const pct = total > 0 ? (count / total) * 100 : 0
    const filled = Math.round(pct / 2.5)
    return '█'.repeat(filled) + '░'.repeat(40 - filled)
  }

  const cases: TextCase[] = ['Sentence', 'lower_case', 'Title_Case', 'UPPER_CASE', 'Mixed']
  const labels: Record<TextCase, string> = {
    Sentence: 'Sentence case',
    lower_case: 'lowercase    ',
    Title_Case: 'Title Case   ',
    UPPER_CASE: 'UPPERCASE    ',
    Mixed: 'Mixed        ',
  }
  const markers: Record<TextCase, string> = {
    Sentence: '✓',
    lower_case: '~',
    Title_Case: '✗',
    UPPER_CASE: '✗',
    Mixed: '-',
  }

  for (const c of cases) {
    const count = stats[c]
    const pct = totalKeys > 0 ? ((count / totalKeys) * 100).toFixed(1) : '0.0'
    console.log(`  ${markers[c]} ${labels[c]}  ${bar(count, totalKeys)}  ${String(count).padStart(4)} (${pct}%)`)
  }
  console.log(`\n  Total: ${totalKeys} text entries\n`)

  // Per-locale
  console.log('  Per locale:\n')
  for (const [locale, data] of Object.entries(byLocale)) {
    const sentencePct = data.total > 0 ? ((data.stats.Sentence / data.total) * 100).toFixed(1) : '0'
    console.log(`    ${locale.toUpperCase()}: ${data.total} entries, ${sentencePct}% sentence case, ${data.violations} violations`)
  }

  // Violations
  if (violations.length > 0) {
    console.log(`\n  ─── Violations (${violations.length}) ───\n`)

    const byCase = new Map<TextCase, TextEntry[]>()
    for (const v of violations) {
      if (!byCase.has(v.case)) {
        byCase.set(v.case, [])
      }
      byCase.get(v.case)!.push(v)
    }

    for (const [caseType, caseEntries] of byCase) {
      console.log(`  ${labels[caseType].trim()} (${caseEntries.length}):\n`)
      const shown = caseEntries.slice(0, 30)
      for (const e of shown) {
        const truncated = e.value.length > 50 ? `${e.value.slice(0, 50)}...` : e.value
        console.log(`    [${e.locale}] ${e.key}`)
        console.log(`         "${truncated}"`)
      }
      if (caseEntries.length > 30) {
        console.log(`    ... and ${caseEntries.length - 30} more\n`)
      }
      console.log()
    }
  } else {
    console.log('\n  ✓ No violations found! All text follows sentence case convention.\n')
  }

  // Summary
  const passing = totalKeys - violations.length
  const pct = totalKeys > 0 ? ((passing / totalKeys) * 100).toFixed(1) : '100'
  console.log(`  Result: ${passing}/${totalKeys} (${pct}%) compliant`)
  if (violations.length > 0) {
    console.log(`  ${violations.length} entries need attention\n`)
    process.exitCode = 1
  } else {
    console.log()
  }
}

const report = analyze()
printReport(report)

#!/usr/bin/env npx tsximport * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// Get project root (relative to this script location)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '../..')

// Directories and files to ignore
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.turbo',
  'coverage',
  '.cache',
  'public',
  '.dev'
])

const IGNORE_FILES = new Set(['.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'])

// File categories
type FileCategory = 'typescript' | 'css' | 'javascript' | 'json' | 'html' | 'markdown' | 'other'

const FILE_CATEGORIES: Record<FileCategory, string[]> = {
  typescript: ['.ts', '.tsx'],
  css: ['.css', '.scss', '.sass', '.less'],
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  json: ['.json'],
  html: ['.html', '.htm'],
  markdown: ['.md', '.mdx'],
  other: []
}

// Statistics
interface CategoryStats {
  total: number
  nonEmpty: number
  files: number
}

const stats: Record<FileCategory, CategoryStats> = {
  typescript: { total: 0, nonEmpty: 0, files: 0 },
  css: { total: 0, nonEmpty: 0, files: 0 },
  javascript: { total: 0, nonEmpty: 0, files: 0 },
  json: { total: 0, nonEmpty: 0, files: 0 },
  html: { total: 0, nonEmpty: 0, files: 0 },
  markdown: { total: 0, nonEmpty: 0, files: 0 },
  other: { total: 0, nonEmpty: 0, files: 0 }
}

const getFileCategory = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase()

  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) {
      return category as FileCategory
    }
  }

  return 'other'
};

const removeComments = (content: string, category: FileCategory) => {
  if (category === 'json') {
    return content
  }

  if (category === 'css') {
    return content.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  if (category === 'html' || category === 'markdown') {
    return content.replace(/<!--[\s\S]*?-->/g, '');
  }

  // For JS/TS remove multi-line and single-line comments
  const result = content.replace(/\/\*[\s\S]*?\*\//g, '')

  const lines = result.split('\n')
  return lines
    .map(line => {
      const inString = /(['"`]).*?\1/.exec(line)
      if (inString) {
        const beforeString = line.substring(0, inString.index)
        const commentIndex = beforeString.indexOf('//')
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex)
        }
      } else {
        const commentIndex = line.indexOf('//')
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex)
        }
      }
      return line
    })
    .join('\n');
};

const analyzeFile = (filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const category = getFileCategory(filePath)

    const withoutComments = removeComments(content, category)
    const lines = withoutComments.split('\n')
    const nonEmptyLines = lines.filter(line => line.trim().length > 0).length

    stats[category].total += lines.length
    stats[category].nonEmpty += nonEmptyLines
    stats[category].files += 1
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Error analyzing ${filePath}: ${message}`)
  }
};

const walkDirectory = (dirPath: string) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) {
        continue
      }
      walkDirectory(fullPath)
    } else if (entry.isFile()) {
      if (IGNORE_FILES.has(entry.name)) {
        continue
      }
      analyzeFile(fullPath)
    }
  }
};

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const printStats = () => {
  console.log('\nLines of Code Statistics\n')
  console.log('='.repeat(80))

  const categories = (Object.keys(stats) as FileCategory[]).filter(cat => stats[cat].files > 0)
  let totalFiles = 0
  let totalLines = 0
  let totalNonEmpty = 0

  // Table header
  console.log(
    `${'Category'.padEnd(15)} | ${'Files'.padStart(8)} | ${'Total Lines'.padStart(15)} | ${'Non-empty'.padStart(15)}`
  )
  console.log('-'.repeat(80))

  // Category data
  for (const category of categories) {
    const { files, total, nonEmpty } = stats[category]
    totalFiles += files
    totalLines += total
    totalNonEmpty += nonEmpty

    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
    console.log(
      `${categoryName.padEnd(15)} | ${formatNumber(files).padStart(8)} | ${formatNumber(total).padStart(15)} | ${formatNumber(nonEmpty).padStart(15)}`
    )
  }

  // Totals
  console.log('='.repeat(80))
  console.log(
    `${'TOTAL'.padEnd(15)} | ${formatNumber(totalFiles).padStart(8)} | ${formatNumber(totalLines).padStart(15)} | ${formatNumber(totalNonEmpty).padStart(15)}`
  )
  console.log('='.repeat(80))

  // Additional info
  const emptyLines = totalLines - totalNonEmpty
  const emptyPercent = totalLines > 0 ? ((emptyLines / totalLines) * 100).toFixed(1) : '0'

  console.log(`\nEmpty lines: ${formatNumber(emptyLines)} (${emptyPercent}%)`)
  console.log(`Code lines: ${formatNumber(totalNonEmpty)}`)
  console.log(`Total files: ${formatNumber(totalFiles)}`)
};

const main = () => {
  const startPath = process.argv[2] || PROJECT_ROOT

  console.log(`\nAnalyzing directory: ${startPath}`)
  console.log(`Counting lines of code...`)

  const startTime = Date.now()

  walkDirectory(startPath)

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  printStats()

  console.log(`\nExecution time: ${duration}s\n`)
};

// Run
main()

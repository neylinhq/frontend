#!/usr/bin/env npx tsximport * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// Get project root (relative to this script location)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '../..')

// Directories to ignore
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.turbo',
  'coverage',
  '.cache',
  'public'
])

// Files to ignore
const IGNORE_FILES = new Set(['.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'])

// Symbols for drawing tree
const SYMBOLS = {
  branch: '|-- ',
  last: '`-- ',
  vertical: '|   ',
  space: '    '
} as const

interface DirEntry {
  name: string
  isDirectory: () => boolean
}

const getSortedEntries = (dirPath: string) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  // Filter ignored files and folders
  const filtered = entries.filter(entry => {
    if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) return false
    if (entry.isFile() && IGNORE_FILES.has(entry.name)) return false
    return true
  })

  // Sort: folders first, then files, alphabetically within each group
  return filtered.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })
};

const buildTree = (dirPath: string, prefix = '') => {
  const entries = getSortedEntries(dirPath)

  entries.forEach((entry, index) => {
    const isLastEntry = index === entries.length - 1
    const connector = isLastEntry ? SYMBOLS.last : SYMBOLS.branch
    const name = entry.isDirectory() ? `${entry.name}/` : entry.name

    console.log(prefix + connector + name)

    if (entry.isDirectory()) {
      const fullPath = path.join(dirPath, entry.name)
      const newPrefix = prefix + (isLastEntry ? SYMBOLS.space : SYMBOLS.vertical)
      buildTree(fullPath, newPrefix)
    }
  })
};

const countItems = (dirPath: string) => {
  let files = 0
  let dirs = 0

  const walk = (currentPath: string) => {
    const entries = getSortedEntries(currentPath)

    entries.forEach(entry => {
      if (entry.isDirectory()) {
        dirs++
        const fullPath = path.join(currentPath, entry.name)
        walk(fullPath)
      } else {
        files++
      }
    })
  };

  walk(dirPath)
  return { files, dirs }
};

const main = () => {
  const startPath = process.argv[2] || PROJECT_ROOT
  const projectName = path.basename(startPath)

  console.log(`\n${projectName}/\n`)

  buildTree(startPath)

  const { files, dirs } = countItems(startPath)
  console.log(`\n${dirs} directories, ${files} files\n`)
};

// Run
main()

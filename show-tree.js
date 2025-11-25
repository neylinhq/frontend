#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Директории для игнорирования
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

// Файлы для игнорирования
const IGNORE_FILES = new Set(['.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'])

// Символы для рисования дерева
const SYMBOLS = {
  branch: '├── ',
  last: '└── ',
  vertical: '│   ',
  space: '    '
}

/**
 * Получает список записей директории с сортировкой (папки первыми)
 */
function getSortedEntries(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  // Фильтруем игнорируемые файлы и папки
  const filtered = entries.filter((entry) => {
    if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) return false
    if (entry.isFile() && IGNORE_FILES.has(entry.name)) return false
    return true
  })

  // Сортируем: папки первыми, затем файлы, внутри каждой группы - по алфавиту
  return filtered.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Рекурсивно строит дерево
 */
function buildTree(dirPath, prefix = '', isLast = true) {
  const entries = getSortedEntries(dirPath)

  entries.forEach((entry, index) => {
    const isLastEntry = index === entries.length - 1
    const connector = isLastEntry ? SYMBOLS.last : SYMBOLS.branch
    const name = entry.isDirectory() ? `${entry.name}/` : entry.name

    console.log(prefix + connector + name)

    if (entry.isDirectory()) {
      const fullPath = path.join(dirPath, entry.name)
      const newPrefix = prefix + (isLastEntry ? SYMBOLS.space : SYMBOLS.vertical)
      buildTree(fullPath, newPrefix, isLastEntry)
    }
  })
}

/**
 * Подсчитывает общее количество файлов и папок
 */
function countItems(dirPath) {
  let files = 0
  let dirs = 0

  function walk(currentPath) {
    const entries = getSortedEntries(currentPath)

    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        dirs++
        const fullPath = path.join(currentPath, entry.name)
        walk(fullPath)
      } else {
        files++
      }
    })
  }

  walk(dirPath)
  return { files, dirs }
}

// Главная функция
function main() {
  const startPath = process.argv[2] || process.cwd()
  const projectName = path.basename(startPath)

  console.log(`\n📁 ${projectName}/\n`)

  buildTree(startPath)

  const { files, dirs } = countItems(startPath)
  console.log(`\n${dirs} directories, ${files} files\n`)
}

// Запуск
main()

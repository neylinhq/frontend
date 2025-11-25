#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Директории и файлы для игнорирования
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

const IGNORE_FILES = new Set(['.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'])

// Категории файлов
const FILE_CATEGORIES = {
  typescript: ['.ts', '.tsx'],
  css: ['.css', '.scss', '.sass', '.less'],
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  json: ['.json'],
  html: ['.html', '.htm'],
  markdown: ['.md', '.mdx'],
  other: []
}

// Статистика
const stats = {
  typescript: { total: 0, nonEmpty: 0, files: 0 },
  css: { total: 0, nonEmpty: 0, files: 0 },
  javascript: { total: 0, nonEmpty: 0, files: 0 },
  json: { total: 0, nonEmpty: 0, files: 0 },
  html: { total: 0, nonEmpty: 0, files: 0 },
  markdown: { total: 0, nonEmpty: 0, files: 0 },
  other: { total: 0, nonEmpty: 0, files: 0 }
}

/**
 * Определяет категорию файла по расширению
 */
function getFileCategory(filePath) {
  const ext = path.extname(filePath).toLowerCase()

  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) {
      return category
    }
  }

  return 'other'
}

/**
 * Удаляет комментарии из кода
 */
function removeComments(content, category) {
  if (category === 'json') {
    // JSON не имеет комментариев по стандарту
    return content
  }

  if (category === 'css') {
    // Удаляем CSS комментарии /* */
    return content.replace(/\/\*[\s\S]*?\*\//g, '')
  }

  if (category === 'html') {
    // Удаляем HTML комментарии <!-- -->
    return content.replace(/<!--[\s\S]*?-->/g, '')
  }

  if (category === 'markdown') {
    // В Markdown комментарии это HTML комментарии
    return content.replace(/<!--[\s\S]*?-->/g, '')
  }

  // Для JS/TS удаляем многострочные и однострочные комментарии
  // Сначала многострочные
  let result = content.replace(/\/\*[\s\S]*?\*\//g, '')

  // Затем однострочные, но не внутри строк
  const lines = result.split('\n')
  return lines
    .map((line) => {
      // Простая эвристика: удаляем // комментарии, если они не внутри строк
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
    .join('\n')
}

/**
 * Анализирует файл
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const category = getFileCategory(filePath)

    // Удаляем комментарии
    const withoutComments = removeComments(content, category)

    // Разбиваем на строки
    const lines = withoutComments.split('\n')

    // Считаем непустые строки (строки с хотя бы одним непробельным символом)
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0).length

    // Обновляем статистику
    stats[category].total += lines.length
    stats[category].nonEmpty += nonEmptyLines
    stats[category].files += 1
  } catch (error) {
    console.error(`Error analyzing ${filePath}: ${error.message}`)
  }
}

/**
 * Рекурсивно обходит директорию
 */
function walkDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      // Пропускаем игнорируемые директории
      if (IGNORE_DIRS.has(entry.name)) {
        continue
      }
      walkDirectory(fullPath)
    } else if (entry.isFile()) {
      // Пропускаем игнорируемые файлы
      if (IGNORE_FILES.has(entry.name)) {
        continue
      }
      analyzeFile(fullPath)
    }
  }
}

/**
 * Форматирует число с разделителями тысяч
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Выводит статистику
 */
function printStats() {
  console.log('\n📊 Статистика строк кода\n')
  console.log('=' .repeat(80))

  const categories = Object.keys(stats).filter((cat) => stats[cat].files > 0)
  let totalFiles = 0
  let totalLines = 0
  let totalNonEmpty = 0

  // Заголовок таблицы
  console.log(
    `${'Категория'.padEnd(15)} | ${'Файлов'.padStart(8)} | ${'Всего строк'.padStart(15)} | ${'Без пустых'.padStart(15)}`
  )
  console.log('-'.repeat(80))

  // Данные по категориям
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

  // Итоги
  console.log('='.repeat(80))
  console.log(
    `${'ИТОГО'.padEnd(15)} | ${formatNumber(totalFiles).padStart(8)} | ${formatNumber(totalLines).padStart(15)} | ${formatNumber(totalNonEmpty).padStart(15)}`
  )
  console.log('='.repeat(80))

  // Дополнительная информация
  const emptyLines = totalLines - totalNonEmpty
  const emptyPercent = totalLines > 0 ? ((emptyLines / totalLines) * 100).toFixed(1) : 0

  console.log(`\n📝 Пустых строк: ${formatNumber(emptyLines)} (${emptyPercent}%)`)
  console.log(`📄 Строк с кодом: ${formatNumber(totalNonEmpty)}`)
  console.log(`📦 Всего файлов: ${formatNumber(totalFiles)}`)
}

// Главная функция
function main() {
  const startPath = process.argv[2] || process.cwd()

  console.log(`\n🔍 Анализ директории: ${startPath}`)
  console.log(`⏳ Подсчет строк кода...`)

  const startTime = Date.now()

  walkDirectory(startPath)

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  printStats()

  console.log(`\n⏱️  Время выполнения: ${duration}s\n`)
}

// Запуск
main()

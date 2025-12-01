import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

// Fix "export default const X = ..." -> "const X = ...\nexport default X"
const pattern = /export default const (\w+) = /g

const files = await glob('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.dev/transforms/fix-export-default.mjs'],
})

let fixedCount = 0

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8')

  if (!content.includes('export default const')) continue

  // Find all matches to get the variable names
  const matches = [...content.matchAll(pattern)]
  if (matches.length === 0) continue

  let newContent = content

  for (const match of matches) {
    const varName = match[1]
    // Replace "export default const X = " with "const X = "
    newContent = newContent.replace(`export default const ${varName} = `, `const ${varName} = `)
  }

  // Now add "export default X" at the end for each variable
  // But we need to handle the case where the const might already have a semicolon at the end
  for (const match of matches) {
    const varName = match[1]
    // Find the end of the file (before any trailing newlines)
    newContent = newContent.trimEnd() + `\n\nexport default ${varName}\n`
  }

  fs.writeFileSync(file, newContent)
  fixedCount++
  console.log(`Fixed: ${file}`)
}

console.log(`\nTotal fixed: ${fixedCount} files`)

/**
 * FSD Structure Validator
 *
 * Validates Feature-Sliced Design modular structure in src/
 *
 * Rules checked:
 * 1. Groups have NO index.ts, NO files at group level
 * 2. Modules MUST have index.ts
 * 3. Flat modules: 2-5 files, [domain].*.ts pattern
 * 4. Segmented modules: components/, model/, lib/, api/, styles/
 * 5. /components: ONLY .tsx files, NO nested folders
 * 6. /lib: FLAT structure, NO subdirectories, NO React hooks
 * 7. /styles: ONLY .module.css
 * 8. /model: files use [domain].*.ts or [domain].[subpart].*.ts pattern
 *    - domain = module name OR component name from components/
 *    - subpart = optional dot-separated part (e.g., graph.layout.hooks.ts)
 * 9. shared/core/: free internal structure, but MUST have index.ts
 * 10. module/__tests__/: FLAT, [module|component].[part?].[test|integration].ts
 * 11. app/__tests__/: group dirs with [scenario].[e2e|integration].ts
 * 12. NO .server.ts exports in index.ts (prevents client bundle leak)
 * 13. NO React hooks (useState, useEffect, etc.) in /lib (use /model instead)
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// ============================================================================
// Types
// ============================================================================

interface ValidationError {
  path: string
  rule: string
  message: string
  severity: 'error' | 'warning'
}

interface ModuleInfo {
  path: string
  name: string
  type: 'flat' | 'segmented' | 'core'
  layer: string
  group?: string
  fileCount: number
  segments: string[]
  errors: ValidationError[]
}

interface GroupInfo {
  path: string
  name: string
  layer: string
  modules: string[]
  errors: ValidationError[]
}

interface LayerStats {
  modules: number
  groups: number
  flatModules: number
  segmentedModules: number
  coreModules: number
  errors: number
  warnings: number
}

interface ValidationReport {
  layers: Record<string, LayerStats>
  modules: ModuleInfo[]
  groups: GroupInfo[]
  errors: ValidationError[]
  summary: {
    totalModules: number
    totalGroups: number
    totalFlat: number
    totalSegmented: number
    totalCore: number
    totalErrors: number
    totalWarnings: number
  }
}

// ============================================================================
// Constants
// ============================================================================

const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] as const
type Layer = (typeof LAYERS)[number]

const ALLOWED_SEGMENTS = ['components', 'model', 'lib', 'api', 'styles'] as const

// Special directories that are allowed but not FSD segments
const SPECIAL_DIRS = ['__mocks__', '__tests__', 'pkg', 'wasm', 'ui'] as const

// Infrastructure directories in shared/ - NOT modules, skip FSD validation
// Each has its own simple structure (documented in 02-modules.md):
// - api/: STRICTLY client.ts + server.ts
// - config/: flat kebab-case.ts files
// - lib/: flat kebab-case.ts files
// - hooks/: use-*.ts pattern
// - styles/: any .css files
// - mocks/: client.ts, server.ts + data/, handlers/
// - core/: group of modules with free internal structure
const SHARED_INFRA_DIRS = ['api', 'config', 'lib', 'hooks', 'styles', 'mocks', 'core'] as const

// Allowed suffixes in flat module files: [domain].suffix.ts
// e.g., user.types.ts, user.schema.ts, user.api.ts
const ALLOWED_FLAT_SUFFIXES = [
  'tsx',        // [domain].tsx - single component
  'types',      // [domain].types.ts
  'constants',  // [domain].constants.ts
  'schema',     // [domain].schema.ts
  'utils',      // [domain].utils.ts
  'hooks',      // [domain].hooks.ts
  'api',        // [domain].api.ts
  'queries',    // [domain].queries.ts
  'config',     // [domain].config.ts
  'server',     // [domain].server.ts
  'd',          // [domain].d.ts
  'module',     // [domain].module.css
  'store',      // [domain].store.ts
  'context'     // [domain].context.ts - React Context providers
  // NO .test.ts here - tests go to __tests__/
] as const

// Allowed suffixes in api/ segment: [domain].suffix.ts
const ALLOWED_API_SUFFIXES = ['api', 'queries'] as const

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

const getFiles = (dir: string): string[] => {
  try {
    return fs.readdirSync(dir).filter((f) => isFile(path.join(dir, f)))
  } catch {
    return []
  }
}

const getDirs = (dir: string): string[] => {
  try {
    return fs.readdirSync(dir).filter((d) => isDirectory(path.join(dir, d)))
  } catch {
    return []
  }
}

const hasIndexTs = (dir: string): boolean => {
  return isFile(path.join(dir, 'index.ts')) || isFile(path.join(dir, 'index.tsx'))
}

const getRelativePath = (fullPath: string, srcPath: string): string => {
  return path.relative(srcPath, fullPath).replace(/\\/g, '/')
}

// ============================================================================
// Validators
// ============================================================================

const validateFlatModule = (
  modulePath: string,
  moduleName: string,
  srcPath: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const files = getFiles(modulePath)
  const dirs = getDirs(modulePath)
  const relPath = getRelativePath(modulePath, srcPath)

  // Get component names if components/ exists (for __tests__ validation)
  const componentsPath = path.join(modulePath, 'components')
  const componentNames = isDirectory(componentsPath)
    ? getFiles(componentsPath).filter((f) => f.endsWith('.tsx'))
    : []

  // Validate __tests__/ if it exists
  const testsPath = path.join(modulePath, '__tests__')
  if (isDirectory(testsPath)) {
    errors.push(...validateTestsSegment(testsPath, moduleName, componentNames, srcPath))
  }

  // Check for disallowed directories (except components/ which converts to segmented)
  for (const dir of dirs) {
    if (dir === 'components') {
      // This is fine - module has multiple components
      continue
    }
    // Skip special directories
    if (SPECIAL_DIRS.includes(dir as (typeof SPECIAL_DIRS)[number])) {
      continue
    }
    if (!ALLOWED_SEGMENTS.includes(dir as (typeof ALLOWED_SEGMENTS)[number])) {
      errors.push({
        path: `${relPath}/${dir}`,
        rule: 'flat-module-no-dirs',
        message: `Flat module should not have directory '${dir}'`,
        severity: 'error'
      })
    }
  }

  // Check file naming pattern: [moduleName].suffix.ts
  for (const file of files) {
    if (file === 'index.ts' || file === 'index.tsx') continue
    if (file.startsWith('.')) continue

    // Parse filename: "user.types.ts" -> domain="user", suffix="types", ext="ts"
    // or "user.tsx" -> domain="user", suffix=null, ext="tsx"
    const parts = file.split('.')

    if (parts.length < 2) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'flat-module-naming',
        message: `Invalid filename format: '${file}'`,
        severity: 'warning'
      })
      continue
    }

    const domain = parts[0]
    // For "user.types.ts" -> suffix = "types"
    // For "user.tsx" -> suffix = null (just component)
    const suffix = parts.length > 2 ? parts[1] : null

    // Domain must match module name exactly
    if (domain !== moduleName) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'flat-module-naming',
        message: `File should start with [${moduleName}], got '${domain}'`,
        severity: 'warning'
      })
      continue
    }

    // If there's a suffix, it must be from allowed list
    if (suffix && !ALLOWED_FLAT_SUFFIXES.includes(suffix as (typeof ALLOWED_FLAT_SUFFIXES)[number])) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'flat-module-naming',
        message: `Unknown suffix '.${suffix}' in '${file}', allowed: ${ALLOWED_FLAT_SUFFIXES.join(', ')}`,
        severity: 'warning'
      })
    }
  }

  return errors
}

const validateComponentsSegment = (
  segmentPath: string,
  srcPath: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const files = getFiles(segmentPath)
  const dirs = getDirs(segmentPath)
  const relPath = getRelativePath(segmentPath, srcPath)

  // No nested directories allowed
  if (dirs.length > 0) {
    for (const dir of dirs) {
      errors.push({
        path: `${relPath}/${dir}`,
        rule: 'components-no-nested',
        message: `No nested directories allowed in /components, found '${dir}'`,
        severity: 'error'
      })
    }
  }

  // Check file types - NO .test.ts here, tests go to __tests__/
  for (const file of files) {
    if (file.startsWith('.')) continue

    const allowedInComponents = ['.tsx', '.types.ts', '.constants.ts', '.schema.ts', '.utils.ts', '.hooks.ts', '.module.css']
    const hasAllowedExt = allowedInComponents.some((ext) => file.endsWith(ext))

    if (!hasAllowedExt) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'components-file-types',
        message: `Only .tsx, .types.ts, .constants.ts, .schema.ts, .utils.ts, .hooks.ts, .module.css allowed in /components, found '${file}'. Tests go to __tests__/`,
        severity: 'error'
      })
    }
  }

  return errors
}

const validateLibSegment = (segmentPath: string, srcPath: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const dirs = getDirs(segmentPath)
  const files = getFiles(segmentPath)
  const relPath = getRelativePath(segmentPath, srcPath)

  // No nested directories allowed - FLAT structure
  if (dirs.length > 0) {
    for (const dir of dirs) {
      errors.push({
        path: `${relPath}/${dir}`,
        rule: 'lib-flat-structure',
        message: `/lib must be FLAT, no subdirectories allowed, found '${dir}'`,
        severity: 'error'
      })
    }
  }

  // Check for React hooks usage in lib files
  const reactHooks = [
    'useState',
    'useEffect',
    'useContext',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',
    'useDeferredValue',
    'useTransition',
    'useId',
    'useSyncExternalStore',
    'useInsertionEffect'
  ]

  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue
    if (file.startsWith('.')) continue

    const filePath = path.join(segmentPath, file)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')

      // Check for React hook usage
      const foundHooks = reactHooks.filter(hook => {
        // Match: useState( or useState<
        const hookPattern = new RegExp(`\\b${hook}[(<]`, 'g')
        return hookPattern.test(content)
      })

      if (foundHooks.length > 0) {
        errors.push({
          path: `${relPath}/${file}`,
          rule: 'lib-no-react-hooks',
          message: `React hooks NOT allowed in /lib (use /model instead). Found: ${foundHooks.join(', ')}`,
          severity: 'error'
        })
      }
    } catch {
      // Ignore read errors
    }
  }

  return errors
}

const validateStylesSegment = (segmentPath: string, srcPath: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const files = getFiles(segmentPath)
  const relPath = getRelativePath(segmentPath, srcPath)

  for (const file of files) {
    if (file.startsWith('.')) continue

    if (!file.endsWith('.module.css')) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'styles-only-module-css',
        message: `Only .module.css allowed in /styles, found '${file}'`,
        severity: 'error'
      })
    }
  }

  return errors
}

/**
 * Validates api/ segment in a module
 *
 * Rules:
 * 1. Files must be .api.ts or .queries.ts
 * 2. Follow [domain].suffix.ts pattern
 */
const validateApiSegment = (
  segmentPath: string,
  moduleName: string,
  srcPath: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const files = getFiles(segmentPath)
  const dirs = getDirs(segmentPath)
  const relPath = getRelativePath(segmentPath, srcPath)

  // No nested directories allowed
  if (dirs.length > 0) {
    for (const dir of dirs) {
      errors.push({
        path: `${relPath}/${dir}`,
        rule: 'api-no-nested',
        message: `No nested directories allowed in /api, found '${dir}'`,
        severity: 'error'
      })
    }
  }

  for (const file of files) {
    if (file === 'index.ts' || file.startsWith('.')) continue

    // Parse: "user.api.ts" -> domain="user", suffix="api"
    const parts = file.split('.')
    if (parts.length < 3) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'api-naming',
        message: `File should follow [domain].[api|queries].ts pattern, got '${file}'`,
        severity: 'warning'
      })
      continue
    }

    const domain = parts[0]
    const suffix = parts[1]

    // Check suffix is allowed
    if (!ALLOWED_API_SUFFIXES.includes(suffix as (typeof ALLOWED_API_SUFFIXES)[number])) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'api-naming',
        message: `Only .api.ts and .queries.ts allowed in /api, found '.${suffix}' in '${file}'`,
        severity: 'error'
      })
      continue
    }

    // Check domain matches module name
    if (domain !== moduleName) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'api-naming',
        message: `File should start with [${moduleName}], got '${domain}'`,
        severity: 'warning'
      })
    }
  }

  return errors
}

// Allowed suffixes in model/ segment: [domain].suffix.ts
const ALLOWED_MODEL_SUFFIXES = [
  'types',      // [domain].types.ts
  'constants',  // [domain].constants.ts
  'schema',     // [domain].schema.ts
  'store',      // [domain].store.ts
  'hooks',      // [domain].hooks.ts
  'config',     // [domain].config.ts
  'd',          // [domain].d.ts
  'server',     // [domain].server.ts
  'context'     // [domain].context.ts - React Context providers
] as const

// Allowed test types in module __tests__/ segment
// Pattern: [module|component].[part?].[test|integration].ts
const ALLOWED_TEST_TYPES = ['test', 'integration'] as const

// Allowed test types in app/__tests__/
// Pattern: [scenario].[e2e|integration].ts
const ALLOWED_APP_TEST_TYPES = ['e2e', 'integration'] as const

/**
 * Validates __tests__/ directory in a module
 *
 * Rules:
 * 1. FLAT structure - no subdirectories
 * 2. Files follow pattern: [module|component].[part?].[test|integration].ts
 * 3. Domain must be module name or component name from components/
 */
const validateTestsSegment = (
  testsPath: string,
  moduleName: string,
  componentNames: string[],
  srcPath: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const files = getFiles(testsPath)
  const dirs = getDirs(testsPath)
  const relPath = getRelativePath(testsPath, srcPath)

  // Rule 1: FLAT structure - no subdirectories
  if (dirs.length > 0) {
    for (const dir of dirs) {
      errors.push({
        path: `${relPath}/${dir}`,
        rule: 'tests-flat-structure',
        message: `__tests__/ must be FLAT, no subdirectories allowed, found '${dir}'`,
        severity: 'error'
      })
    }
  }

  // Rule 2 & 3: Validate file naming
  for (const file of files) {
    if (file.startsWith('.')) continue

    // Must be .ts or .tsx
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'tests-file-type',
        message: `Only .ts/.tsx files allowed in __tests__/, found '${file}'`,
        severity: 'error'
      })
      continue
    }

    // Parse: "sign-in-form.validation.test.ts" -> domain="sign-in-form", part="validation", type="test"
    // or: "sign-in-form.test.ts" -> domain="sign-in-form", part=null, type="test"
    const parts = file.split('.')

    // Minimum: domain.type.ts (3 parts)
    if (parts.length < 3) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'tests-naming',
        message: `Test file should follow [domain].[part?].[test|integration].ts pattern, got '${file}'`,
        severity: 'warning'
      })
      continue
    }

    const domain = parts[0]
    const testType = parts[parts.length - 2] // 'test' or 'integration'

    // Check test type is valid
    if (!ALLOWED_TEST_TYPES.includes(testType as (typeof ALLOWED_TEST_TYPES)[number])) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'tests-naming',
        message: `Test type must be 'test' or 'integration', got '${testType}' in '${file}'`,
        severity: 'warning'
      })
      continue
    }

    // Check domain is module name or component name
    const validDomains = [moduleName, ...componentNames.map((c) => c.replace('.tsx', ''))]

    if (!validDomains.includes(domain)) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'tests-naming',
        message: `Test domain '${domain}' not found. Valid: ${validDomains.join(', ')}`,
        severity: 'warning'
      })
    }
  }

  return errors
}

/**
 * Validates app/__tests__/ directory for cross-module e2e tests
 *
 * Rules:
 * 1. Contains group subdirectories (auth/, billing/, graph/)
 * 2. Group dirs contain e2e test files: [scenario].[e2e|integration].ts
 * 3. Root can have smoke.e2e.ts and similar cross-cutting tests
 */
const validateAppTestsDirectory = (
  testsPath: string,
  srcPath: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const files = getFiles(testsPath)
  const dirs = getDirs(testsPath)
  const relPath = getRelativePath(testsPath, srcPath)

  // Validate root files (smoke tests, etc.)
  for (const file of files) {
    if (file.startsWith('.')) continue

    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'app-tests-file-type',
        message: `Only .ts/.tsx files allowed in app/__tests__/, found '${file}'`,
        severity: 'error'
      })
      continue
    }

    // Parse: "smoke.e2e.ts" -> scenario="smoke", type="e2e"
    const parts = file.split('.')
    if (parts.length < 3) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'app-tests-naming',
        message: `Test file should follow [scenario].[e2e|integration].ts pattern, got '${file}'`,
        severity: 'warning'
      })
      continue
    }

    const testType = parts[parts.length - 2]
    if (!ALLOWED_APP_TEST_TYPES.includes(testType as (typeof ALLOWED_APP_TEST_TYPES)[number])) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'app-tests-naming',
        message: `App test type must be 'e2e' or 'integration', got '${testType}' in '${file}'`,
        severity: 'warning'
      })
    }
  }

  // Validate group directories
  for (const dir of dirs) {
    const groupPath = path.join(testsPath, dir)
    const groupFiles = getFiles(groupPath)
    const groupDirs = getDirs(groupPath)
    const groupRelPath = `${relPath}/${dir}`

    // No nested directories inside group
    if (groupDirs.length > 0) {
      for (const nestedDir of groupDirs) {
        errors.push({
          path: `${groupRelPath}/${nestedDir}`,
          rule: 'app-tests-flat-groups',
          message: `No nested directories allowed in test group '${dir}/', found '${nestedDir}'`,
          severity: 'error'
        })
      }
    }

    // Validate files in group
    for (const file of groupFiles) {
      if (file.startsWith('.')) continue

      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
        errors.push({
          path: `${groupRelPath}/${file}`,
          rule: 'app-tests-file-type',
          message: `Only .ts/.tsx files allowed, found '${file}'`,
          severity: 'error'
        })
        continue
      }

      const parts = file.split('.')
      if (parts.length < 3) {
        errors.push({
          path: `${groupRelPath}/${file}`,
          rule: 'app-tests-naming',
          message: `Test file should follow [scenario].[e2e|integration].ts pattern, got '${file}'`,
          severity: 'warning'
        })
        continue
      }

      const testType = parts[parts.length - 2]
      if (!ALLOWED_APP_TEST_TYPES.includes(testType as (typeof ALLOWED_APP_TEST_TYPES)[number])) {
        errors.push({
          path: `${groupRelPath}/${file}`,
          rule: 'app-tests-naming',
          message: `App test type must be 'e2e' or 'integration', got '${testType}' in '${file}'`,
          severity: 'warning'
        })
      }
    }
  }

  return errors
}

const validateModelSegment = (
  segmentPath: string,
  moduleName: string,
  componentNames: string[],
  srcPath: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const files = getFiles(segmentPath)
  const relPath = getRelativePath(segmentPath, srcPath)

  for (const file of files) {
    if (file === 'index.ts' || file.startsWith('.')) continue

    // Parse: "graph.types.ts" -> domain="graph", suffix="types"
    // Parse: "graph-layout.hooks.ts" -> domain="graph-layout", suffix="hooks"
    // NO use-*.ts exception - hooks must be in [domain].hooks.ts
    const parts = file.split('.')
    if (parts.length < 3) {
      // Must have at least domain.suffix.ext
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'model-naming',
        message: `File should follow [domain].suffix.ts pattern, got '${file}'`,
        severity: 'warning'
      })
      continue
    }

    // Last two parts are suffix and extension, everything before is domain
    // ext = parts[parts.length - 1] // "ts" or "tsx" (unused)
    const suffix = parts[parts.length - 2] // "types", "hooks", etc.
    const domain = parts.slice(0, -2).join('.') // "graph" or "graph-layout"

    // Check suffix is allowed
    if (!ALLOWED_MODEL_SUFFIXES.includes(suffix as (typeof ALLOWED_MODEL_SUFFIXES)[number])) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'model-naming',
        message: `Unknown suffix '.${suffix}' in '${file}', allowed: ${ALLOWED_MODEL_SUFFIXES.join(', ')}`,
        severity: 'warning'
      })
      continue
    }

    // Check domain is:
    // 1. Module name: "graph.hooks.ts" (domain = "graph")
    // 2. Module name with subpart: "graph.layout.hooks.ts" (domain = "graph.layout")
    // 3. Component name: "node-drawer.hooks.ts" (if components/node-drawer.tsx exists)
    // 4. Component name with subpart: "node-drawer.panel.hooks.ts" (domain = "node-drawer.panel")
    const isModuleDomain = domain === moduleName || domain.startsWith(`${moduleName}.`)
    const isComponentDomain = componentNames.some((c) => {
      const name = c.replace('.tsx', '')
      return domain === name || domain.startsWith(`${name}.`)
    })

    if (!isModuleDomain && !isComponentDomain) {
      const validDomains = [moduleName, `${moduleName}.*`, ...componentNames.map((c) => c.replace('.tsx', ''))]
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'model-naming',
        message: `Domain '${domain}' must be module name or component name (with optional .subpart). Valid: ${validDomains.join(', ')}`,
        severity: 'warning'
      })
    }
  }

  return errors
}

const validateSegmentedModule = (
  modulePath: string,
  moduleName: string,
  srcPath: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const dirs = getDirs(modulePath)
  const relPath = getRelativePath(modulePath, srcPath)

  // Get component names for model/ validation
  const componentsPath = path.join(modulePath, 'components')
  const componentNames = isDirectory(componentsPath)
    ? getFiles(componentsPath).filter((f) => f.endsWith('.tsx'))
    : []

  for (const dir of dirs) {
    const segmentPath = path.join(modulePath, dir)

    // Skip special directories
    if (SPECIAL_DIRS.includes(dir as (typeof SPECIAL_DIRS)[number])) {
      continue
    }

    if (!ALLOWED_SEGMENTS.includes(dir as (typeof ALLOWED_SEGMENTS)[number])) {
      errors.push({
        path: `${relPath}/${dir}`,
        rule: 'segmented-allowed-dirs',
        message: `Unknown segment '${dir}', allowed: ${ALLOWED_SEGMENTS.join(', ')}`,
        severity: 'warning'
      })
      continue
    }

    switch (dir) {
      case 'components':
        errors.push(...validateComponentsSegment(segmentPath, srcPath))
        break
      case 'lib':
        errors.push(...validateLibSegment(segmentPath, srcPath))
        break
      case 'styles':
        errors.push(...validateStylesSegment(segmentPath, srcPath))
        break
      case 'model':
        errors.push(...validateModelSegment(segmentPath, moduleName, componentNames, srcPath))
        break
      case 'api':
        errors.push(...validateApiSegment(segmentPath, moduleName, srcPath))
        break
    }
  }

  // Validate __tests__/ if it exists
  const testsPath = path.join(modulePath, '__tests__')
  if (isDirectory(testsPath)) {
    errors.push(...validateTestsSegment(testsPath, moduleName, componentNames, srcPath))
  }

  return errors
}

/**
 * Validates that index.ts does NOT export .server.ts files
 *
 * .server.ts files contain server-only code (DB queries, auth, etc.)
 * and must NOT leak into client bundles through barrel exports.
 */
const validateNoServerInBarrel = (
  modulePath: string,
  srcPath: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const relPath = getRelativePath(modulePath, srcPath)

  const indexPath = path.join(modulePath, 'index.ts')
  if (!isFile(indexPath)) return errors

  try {
    const indexContent = fs.readFileSync(indexPath, 'utf-8')

    // Check for .server imports/exports
    // Matches: from './foo.server', from "../model/bar.server", etc.
    const serverImportPattern = /['"]\..*\.server['"]/g
    const matches = indexContent.match(serverImportPattern)

    if (matches) {
      errors.push({
        path: `${relPath}/index.ts`,
        rule: 'no-server-in-barrel',
        message: `.server.ts files must NOT be exported via index.ts (client bundle leak). Found: ${matches.join(', ')}`,
        severity: 'error'
      })
    }
  } catch {
    // Ignore read errors
  }

  return errors
}

const validateCoreModule = (modulePath: string, srcPath: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const relPath = getRelativePath(modulePath, srcPath)

  // Core modules MUST have index.ts
  if (!hasIndexTs(modulePath)) {
    errors.push({
      path: relPath,
      rule: 'core-must-have-index',
      message: 'Core module MUST have index.ts',
      severity: 'error'
    })
  }

  // Check for .server.ts in barrel
  errors.push(...validateNoServerInBarrel(modulePath, srcPath))

  // Core modules have free internal structure, so no other checks

  return errors
}

const validateGroup = (groupPath: string, srcPath: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const files = getFiles(groupPath)
  const relPath = getRelativePath(groupPath, srcPath)

  // Groups should NOT have index.ts
  if (hasIndexTs(groupPath)) {
    errors.push({
      path: relPath,
      rule: 'group-no-index',
      message: 'Group should NOT have index.ts (groups are just folders)',
      severity: 'error'
    })
  }

  // Groups should NOT have files at group level
  const nonHiddenFiles = files.filter((f) => !f.startsWith('.'))
  if (nonHiddenFiles.length > 0) {
    for (const file of nonHiddenFiles) {
      errors.push({
        path: `${relPath}/${file}`,
        rule: 'group-no-files',
        message: `No files allowed at group level, found '${file}'`,
        severity: 'error'
      })
    }
  }

  return errors
}

// ============================================================================
// Main Analysis
// ============================================================================

const analyzeModule = (
  modulePath: string,
  layer: Layer,
  group: string | undefined,
  srcPath: string,
  isCore: boolean
): ModuleInfo => {
  const moduleName = path.basename(modulePath)
  const dirs = getDirs(modulePath)
  const fileCount = countFilesRecursive(modulePath)

  let moduleType: 'flat' | 'segmented' | 'core'
  let errors: ValidationError[] = []
  const relPath = getRelativePath(modulePath, srcPath)

  // Must have index.ts
  if (!hasIndexTs(modulePath)) {
    errors.push({
      path: relPath,
      rule: 'module-must-have-index',
      message: 'Module MUST have index.ts',
      severity: 'error'
    })
  }

  if (isCore) {
    moduleType = 'core'
    errors.push(...validateCoreModule(modulePath, srcPath))
  } else {
    // Determine if flat or segmented
    const hasSegments = dirs.some((d) =>
      ALLOWED_SEGMENTS.includes(d as (typeof ALLOWED_SEGMENTS)[number])
    )

    if (hasSegments || fileCount > 5) {
      moduleType = 'segmented'
      errors.push(...validateSegmentedModule(modulePath, moduleName, srcPath))
    } else {
      moduleType = 'flat'
      errors.push(...validateFlatModule(modulePath, moduleName, srcPath))
    }

    // Check for .server.ts in barrel (all non-core modules)
    errors.push(...validateNoServerInBarrel(modulePath, srcPath))
  }

  return {
    path: relPath,
    name: moduleName,
    type: moduleType,
    layer,
    group,
    fileCount,
    segments: dirs.filter((d) => ALLOWED_SEGMENTS.includes(d as (typeof ALLOWED_SEGMENTS)[number])),
    errors
  }
}

const countFilesRecursive = (dir: string): number => {
  let count = 0
  try {
    const entries = fs.readdirSync(dir)
    for (const entry of entries) {
      if (entry.startsWith('.')) continue
      const fullPath = path.join(dir, entry)
      if (isFile(fullPath)) {
        count++
      } else if (isDirectory(fullPath)) {
        count += countFilesRecursive(fullPath)
      }
    }
  } catch {
    // ignore
  }
  return count
}

const isGroup = (dirPath: string): boolean => {
  // A directory is a group if:
  // 1. It has no index.ts
  // 2. It contains subdirectories that ARE modules (have index.ts)
  if (hasIndexTs(dirPath)) return false

  const subdirs = getDirs(dirPath)
  return subdirs.some((sub) => hasIndexTs(path.join(dirPath, sub)))
}

const analyzeLayer = (
  layerPath: string,
  layer: Layer,
  srcPath: string,
  report: ValidationReport
): void => {
  if (!isDirectory(layerPath)) return

  const entries = getDirs(layerPath)

  // Special handling for app/__tests__/ (e2e tests)
  if (layer === 'app') {
    const appTestsPath = path.join(layerPath, '__tests__')
    if (isDirectory(appTestsPath)) {
      const testErrors = validateAppTestsDirectory(appTestsPath, srcPath)
      report.errors.push(...testErrors)
    }
  }

  // Special handling for shared/core/ and shared/mocks/
  if (layer === 'shared') {
    // shared/core/ - core modules with free internal structure
    const corePath = path.join(layerPath, 'core')
    if (isDirectory(corePath)) {
      const coreModules = getDirs(corePath)
      for (const moduleName of coreModules) {
        const modulePath = path.join(corePath, moduleName)
        const moduleInfo = analyzeModule(modulePath, layer, 'core', srcPath, true)
        report.modules.push(moduleInfo)
        report.errors.push(...moduleInfo.errors)
      }
    }

    // shared/mocks/ - special module with unique MSW structure, skip validation
    // Has: browser.ts, server.ts at root + data/, handlers/ subdirs
    // This is NOT a group, it's a special testing infrastructure module
  }

  for (const entry of entries) {
    // Skip shared/ infrastructure directories - they have unique structures
    if (layer === 'shared' && SHARED_INFRA_DIRS.includes(entry as (typeof SHARED_INFRA_DIRS)[number])) {
      continue
    }

    const entryPath = path.join(layerPath, entry)

    if (isGroup(entryPath)) {
      // It's a group
      const groupErrors = validateGroup(entryPath, srcPath)
      const groupInfo: GroupInfo = {
        path: getRelativePath(entryPath, srcPath),
        name: entry,
        layer,
        modules: [],
        errors: groupErrors
      }

      // Analyze modules inside the group
      const groupModules = getDirs(entryPath)
      for (const moduleName of groupModules) {
        const modulePath = path.join(entryPath, moduleName)
        if (hasIndexTs(modulePath)) {
          const moduleInfo = analyzeModule(modulePath, layer, entry, srcPath, false)
          report.modules.push(moduleInfo)
          report.errors.push(...moduleInfo.errors)
          groupInfo.modules.push(moduleName)
        }
      }

      report.groups.push(groupInfo)
      report.errors.push(...groupErrors)
    } else if (hasIndexTs(entryPath)) {
      // It's a module directly in the layer
      const moduleInfo = analyzeModule(entryPath, layer, undefined, srcPath, false)
      report.modules.push(moduleInfo)
      report.errors.push(...moduleInfo.errors)
    }
  }
}

const validateFSD = (srcPath: string): ValidationReport => {
  const report: ValidationReport = {
    layers: {},
    modules: [],
    groups: [],
    errors: [],
    summary: {
      totalModules: 0,
      totalGroups: 0,
      totalFlat: 0,
      totalSegmented: 0,
      totalCore: 0,
      totalErrors: 0,
      totalWarnings: 0
    }
  }

  // Initialize layer stats
  for (const layer of LAYERS) {
    report.layers[layer] = {
      modules: 0,
      groups: 0,
      flatModules: 0,
      segmentedModules: 0,
      coreModules: 0,
      errors: 0,
      warnings: 0
    }
  }

  // Analyze each layer
  for (const layer of LAYERS) {
    const layerPath = path.join(srcPath, layer)
    analyzeLayer(layerPath, layer, srcPath, report)
  }

  // Calculate stats
  for (const module of report.modules) {
    const layerStats = report.layers[module.layer]
    if (!layerStats) continue

    layerStats.modules++
    report.summary.totalModules++

    switch (module.type) {
      case 'flat':
        layerStats.flatModules++
        report.summary.totalFlat++
        break
      case 'segmented':
        layerStats.segmentedModules++
        report.summary.totalSegmented++
        break
      case 'core':
        layerStats.coreModules++
        report.summary.totalCore++
        break
    }

    for (const error of module.errors) {
      if (error.severity === 'error') {
        layerStats.errors++
        report.summary.totalErrors++
      } else {
        layerStats.warnings++
        report.summary.totalWarnings++
      }
    }
  }

  for (const group of report.groups) {
    const layerStats = report.layers[group.layer]
    if (!layerStats) continue

    layerStats.groups++
    report.summary.totalGroups++

    for (const error of group.errors) {
      if (error.severity === 'error') {
        layerStats.errors++
        report.summary.totalErrors++
      } else {
        layerStats.warnings++
        report.summary.totalWarnings++
      }
    }
  }

  return report
}

// ============================================================================
// Output
// ============================================================================

const formatReport = (report: ValidationReport): string => {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════════════════════')
  lines.push('                    FSD STRUCTURE VALIDATION REPORT')
  lines.push('═══════════════════════════════════════════════════════════════════')
  lines.push('')

  // Summary
  lines.push('┌─────────────────────────────────────────────────────────────────┐')
  lines.push('│                           SUMMARY                              │')
  lines.push('├─────────────────────────────────────────────────────────────────┤')
  lines.push(
    `│  Total Modules: ${report.summary.totalModules.toString().padEnd(8)} │  Flat: ${report.summary.totalFlat.toString().padEnd(8)} │  Segmented: ${report.summary.totalSegmented.toString().padEnd(5)} │`
  )
  lines.push(
    `│  Total Groups:  ${report.summary.totalGroups.toString().padEnd(8)} │  Core: ${report.summary.totalCore.toString().padEnd(8)} │                   │`
  )
  lines.push('├─────────────────────────────────────────────────────────────────┤')
  lines.push(
    `│  Errors: ${report.summary.totalErrors.toString().padEnd(6)} │  Warnings: ${report.summary.totalWarnings.toString().padEnd(6)}                        │`
  )
  lines.push('└─────────────────────────────────────────────────────────────────┘')
  lines.push('')

  // Layer breakdown
  lines.push('┌─────────────────────────────────────────────────────────────────┐')
  lines.push('│                        LAYER BREAKDOWN                          │')
  lines.push('├──────────┬────────┬────────┬──────┬──────────┬──────┬──────────┤')
  lines.push('│  Layer   │Modules │ Groups │ Flat │Segmented │ Core │  Issues  │')
  lines.push('├──────────┼────────┼────────┼──────┼──────────┼──────┼──────────┤')

  for (const layer of LAYERS) {
    const stats = report.layers[layer]
    if (!stats) continue
    const issues = stats.errors + stats.warnings
    const issueStr = issues > 0 ? `${stats.errors}E/${stats.warnings}W` : '✓'
    lines.push(
      `│ ${layer.padEnd(8)} │ ${stats.modules.toString().padStart(6)} │ ${stats.groups.toString().padStart(6)} │ ${stats.flatModules.toString().padStart(4)} │ ${stats.segmentedModules.toString().padStart(8)} │ ${stats.coreModules.toString().padStart(4)} │ ${issueStr.padStart(8)} │`
    )
  }
  lines.push('└──────────┴────────┴────────┴──────┴──────────┴──────┴──────────┘')
  lines.push('')

  // Groups
  if (report.groups.length > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────────┐')
    lines.push('│                           GROUPS                                │')
    lines.push('└─────────────────────────────────────────────────────────────────┘')
    for (const group of report.groups) {
      const status = group.errors.length > 0 ? '✗' : '✓'
      lines.push(`  ${status} ${group.path} (${group.modules.length} modules)`)
      if (group.modules.length > 0) {
        lines.push(`    └─ ${group.modules.join(', ')}`)
      }
    }
    lines.push('')
  }

  // Modules by layer
  lines.push('┌─────────────────────────────────────────────────────────────────┐')
  lines.push('│                          MODULES                                │')
  lines.push('└─────────────────────────────────────────────────────────────────┘')

  for (const layer of LAYERS) {
    const layerModules = report.modules.filter((m) => m.layer === layer)
    if (layerModules.length === 0) continue

    lines.push('')
    lines.push(`  ─── ${layer.toUpperCase()} ───`)

    for (const module of layerModules) {
      const typeIcon = module.type === 'flat' ? '◇' : module.type === 'segmented' ? '◈' : '◆'
      const status = module.errors.length > 0 ? '✗' : '✓'
      const segments = module.segments.length > 0 ? ` [${module.segments.join(', ')}]` : ''
      lines.push(`    ${status} ${typeIcon} ${module.path} (${module.fileCount} files)${segments}`)
    }
  }
  lines.push('')

  // Errors
  if (report.errors.length > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────────┐')
    lines.push('│                           ISSUES                                │')
    lines.push('└─────────────────────────────────────────────────────────────────┘')

    const errors = report.errors.filter((e) => e.severity === 'error')
    const warnings = report.errors.filter((e) => e.severity === 'warning')

    if (errors.length > 0) {
      lines.push('')
      lines.push('  ERRORS:')
      for (const error of errors) {
        lines.push(`    ✗ [${error.rule}] ${error.path}`)
        lines.push(`      ${error.message}`)
      }
    }

    if (warnings.length > 0) {
      lines.push('')
      lines.push('  WARNINGS:')
      for (const warning of warnings) {
        lines.push(`    ⚠ [${warning.rule}] ${warning.path}`)
        lines.push(`      ${warning.message}`)
      }
    }
  }

  lines.push('')
  lines.push('═══════════════════════════════════════════════════════════════════')

  if (report.summary.totalErrors === 0 && report.summary.totalWarnings === 0) {
    lines.push('  ✓ All FSD structure rules are satisfied!')
  } else if (report.summary.totalErrors === 0) {
    lines.push(`  ⚠ Structure is valid but has ${report.summary.totalWarnings} warnings`)
  } else {
    lines.push(`  ✗ Found ${report.summary.totalErrors} errors and ${report.summary.totalWarnings} warnings`)
  }

  lines.push('═══════════════════════════════════════════════════════════════════')

  return lines.join('\n')
}

// ============================================================================
// CLI
// ============================================================================

const main = () => {
  const srcPath = process.argv[2] || path.join(process.cwd(), 'src')

  if (!isDirectory(srcPath)) {
    console.error(`Error: ${srcPath} is not a directory`)
    process.exit(1)
  }

  console.log(`Validating FSD structure in: ${srcPath}\n`)

  const report = validateFSD(srcPath)
  console.log(formatReport(report))

  // Exit with error code if there are errors
  process.exit(report.summary.totalErrors > 0 ? 1 : 0)
}

main()

/**
 * Theme Bridge - Extract CSS variables and convert to WASM-compatible format
 *
 * Extracts theme colors from CSS custom properties and converts them
 * from OKLCH to RGB for use in WebGL shaders.
 */

export interface ThemeColors {
  card_bg: [number, number, number, number]
  card_fg: [number, number, number, number]
  border: [number, number, number, number]
  background: [number, number, number, number]
  muted_fg: [number, number, number, number]
  // Node type colors (8 unique hues)
  concept: [number, number, number, number]
  theory: [number, number, number, number]
  fact: [number, number, number, number]
  example: [number, number, number, number]
  question: [number, number, number, number]
  hypothesis: [number, number, number, number]
  person: [number, number, number, number]
  school: [number, number, number, number]
  // Edge colors (relation types)
  edge_prerequisite: [number, number, number, number]
  edge_causes: [number, number, number, number]
  edge_explains: [number, number, number, number]
  edge_is_a: [number, number, number, number]
  edge_has_a: [number, number, number, number]
  edge_part_of: [number, number, number, number]
  edge_influences: [number, number, number, number]
  edge_related_to: [number, number, number, number]
  edge_contradicts: [number, number, number, number]
  edge_similar_to: [number, number, number, number]
  // Legacy aliases (for backward compatibility)
  knowledge: [number, number, number, number]
  primary: [number, number, number, number]
  glow: [number, number, number, number]
}

/**
 * Check if running in browser environment
 */
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

/**
 * Default theme colors for SSR fallback (dark mode defaults)
 */
const SSR_FALLBACK_COLORS: ThemeColors = {
  card_bg: oklchToRgba('0.19 0 0'),
  card_fg: oklchToRgba('0.93 0 0'),
  border: oklchToRgba('0.28 0 0'),
  background: oklchToRgba('0.16 0 0'),
  muted_fg: oklchToRgba('0.65 0 0'),
  concept: oklchToRgba('0.55 0.17 240'),
  theory: oklchToRgba('0.52 0.18 265'),
  fact: oklchToRgba('0.58 0.17 145'),
  example: oklchToRgba('0.68 0.17 55'),
  question: oklchToRgba('0.55 0.18 290'),
  hypothesis: oklchToRgba('0.58 0.19 315'),
  person: oklchToRgba('0.62 0.18 25'),
  school: oklchToRgba('0.60 0.14 195'),
  edge_prerequisite: oklchToRgba('0.68 0.18 55'),
  edge_causes: oklchToRgba('0.60 0.20 340'),
  edge_explains: oklchToRgba('0.55 0.19 290'),
  edge_is_a: oklchToRgba('0.52 0.18 265'),
  edge_has_a: oklchToRgba('0.58 0.16 160'),
  edge_part_of: oklchToRgba('0.60 0.14 195'),
  edge_influences: oklchToRgba('0.72 0.16 75'),
  edge_related_to: oklchToRgba('0.55 0.16 230'),
  edge_contradicts: oklchToRgba('0.60 0.22 25'),
  edge_similar_to: oklchToRgba('0.60 0.18 130'),
  knowledge: oklchToRgba('0.55 0.17 240'),
  primary: oklchToRgba('0.95 0 0'),
  glow: oklchToRgba('0.95 0 0', 0.5)
}

/**
 * Convert OKLCH string to RGBA array
 * Input format: "0.55 0.17 250" (L C H without units)
 */
function oklchToRgba(oklchString: string, alpha = 1): [number, number, number, number] {
  const parts = oklchString.trim().split(/\s+/)
  if (parts.length < 3) {
    console.warn(`Invalid OKLCH string: "${oklchString}", using fallback`)
    return [0.5, 0.5, 0.5, alpha]
  }

  const L = parseFloat(parts[0])
  const C = parseFloat(parts[1])
  const H = parseFloat(parts[2])

  // OKLCH to OKLab
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  // OKLab to linear RGB via LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  // Linear RGB
  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  // Linear to sRGB gamma correction
  const toSrgb = (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055
  }

  const r = toSrgb(rLin)
  const g = toSrgb(gLin)
  const bVal = toSrgb(bLin)

  return [r, g, bVal, alpha]
}

/**
 * Get CSS variable value from document
 * Returns empty string in SSR environment
 */
function getCssVar(name: string): string {
  if (!isBrowser) return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Extract theme colors from CSS variables
 * Call this when the page loads and when theme changes
 * Returns fallback colors in SSR environment
 */
export function extractThemeColors(): ThemeColors {
  // SSR protection - return fallback colors
  if (!isBrowser) return SSR_FALLBACK_COLORS

  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark')

  // Card colors - use --popover for graph nodes as it's slightly lighter than --card
  // In most themes, --card === --background which makes nodes invisible
  const cardBgRaw = getCssVar('--popover') || getCssVar('--card')
  const cardBg = cardBgRaw || (isDark ? '0.19 0 0' : '0.995 0 0')

  const cardFg = getCssVar('--card-foreground') || (isDark ? '0.93 0 0' : '0.12 0 0')
  const border = getCssVar('--border') || (isDark ? '0.28 0 0' : '0.91 0 0')
  const background = getCssVar('--background') || (isDark ? '0.16 0 0' : '0.99 0 0')
  const mutedFg = getCssVar('--muted-foreground') || (isDark ? '0.65 0 0' : '0.42 0 0')

  // Node type colors - 8 unique hues
  const concept = getCssVar('--node-concept') || '0.55 0.17 240'
  const theory = getCssVar('--node-theory') || '0.52 0.18 265'
  const fact = getCssVar('--node-fact') || '0.58 0.17 145'
  const example = getCssVar('--node-example') || '0.68 0.17 55'
  const question = getCssVar('--node-question') || '0.55 0.18 290'
  const hypothesis = getCssVar('--node-hypothesis') || '0.58 0.19 315'
  const person = getCssVar('--node-person') || '0.62 0.18 25'
  const school = getCssVar('--node-school') || '0.60 0.14 195'

  // UI colors
  const primary = getCssVar('--primary') || (isDark ? '0.95 0 0' : '0.12 0 0')

  // Edge colors
  const edgePrerequisite = getCssVar('--edge-prerequisite') || '0.68 0.18 55'
  const edgeCauses = getCssVar('--edge-causes') || '0.60 0.20 340'
  const edgeExplains = getCssVar('--edge-explains') || '0.55 0.19 290'
  const edgeIsA = getCssVar('--edge-is-a') || '0.52 0.18 265'
  const edgeHasA = getCssVar('--edge-has-a') || '0.58 0.16 160'
  const edgePartOf = getCssVar('--edge-part-of') || '0.60 0.14 195'
  const edgeInfluences = getCssVar('--edge-influences') || '0.72 0.16 75'
  const edgeRelatedTo = getCssVar('--edge-related-to') || '0.55 0.16 230'
  const edgeContradicts = getCssVar('--edge-contradicts') || '0.60 0.22 25'
  const edgeSimilarTo = getCssVar('--edge-similar-to') || '0.60 0.18 130'

  return {
    card_bg: oklchToRgba(cardBg),
    card_fg: oklchToRgba(cardFg),
    border: oklchToRgba(border),
    background: oklchToRgba(background),
    muted_fg: oklchToRgba(mutedFg),
    // Node type colors
    concept: oklchToRgba(concept),
    theory: oklchToRgba(theory),
    fact: oklchToRgba(fact),
    example: oklchToRgba(example),
    question: oklchToRgba(question),
    hypothesis: oklchToRgba(hypothesis),
    person: oklchToRgba(person),
    school: oklchToRgba(school),
    edge_prerequisite: oklchToRgba(edgePrerequisite),
    edge_causes: oklchToRgba(edgeCauses),
    edge_explains: oklchToRgba(edgeExplains),
    edge_is_a: oklchToRgba(edgeIsA),
    edge_has_a: oklchToRgba(edgeHasA),
    edge_part_of: oklchToRgba(edgePartOf),
    edge_influences: oklchToRgba(edgeInfluences),
    edge_related_to: oklchToRgba(edgeRelatedTo),
    edge_contradicts: oklchToRgba(edgeContradicts),
    edge_similar_to: oklchToRgba(edgeSimilarTo),
    // Legacy alias
    knowledge: oklchToRgba(concept),
    primary: oklchToRgba(primary),
    glow: oklchToRgba(primary, 0.5) // Glow with 50% alpha
  }
}

/**
 * Convert theme to JSON for WASM
 * SSR-safe: returns fallback colors JSON in SSR environment
 */
export function themeToJson(): string {
  return JSON.stringify(extractThemeColors()) // SSR-safe
}

/**
 * Convert RGBA array [0-1] to hex string
 */
export function rgbaToHex(rgba: [number, number, number, number]): string {
  const r = Math.round(rgba[0] * 255)
  const g = Math.round(rgba[1] * 255)
  const b = Math.round(rgba[2] * 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Get node color as HEX string for use in React Flow MiniMap
 * SSR-safe: returns fallback color in SSR environment
 * @param nodeType - The node type (concept, theory, fact, etc.)
 * @returns HEX color string
 */
export function getNodeColorHex(nodeType: string): string {
  const colors = extractThemeColors() // SSR-safe
  const rgba = colors[nodeType as keyof ThemeColors] ?? colors.concept
  return rgbaToHex(rgba as [number, number, number, number])
}


/**
 * Get CSS variable as computed value
 * Useful for getting canvas grid color, overlay color, etc.
 * Returns empty string in SSR environment
 */
export function getCssVarValue(name: string): string {
  if (!isBrowser) return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Convert OKLCH CSS variable to HEX
 * @param varName - CSS variable name without -- prefix
 * @returns HEX color string (returns fallback gray in SSR)
 */
export function cssVarToHex(varName: string): string {
  if (!isBrowser) return '#808080'
  const oklchStr = getCssVarValue(`--${varName}`)
  if (!oklchStr) return '#808080'
  const rgba = oklchToRgba(oklchStr)
  return rgbaToHex(rgba)
}

// Export for use in other modules
export { oklchToRgba, getCssVar }

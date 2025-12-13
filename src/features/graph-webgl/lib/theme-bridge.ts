/**
 * Theme Bridge - Extract CSS variables and convert to WASM-compatible format
 *
 * Extracts theme colors from CSS custom properties and converts them
 * from HSL to RGB for use in WebGL shaders.
 */

export interface ThemeColors {
  card_bg: [number, number, number, number]
  card_fg: [number, number, number, number]
  border: [number, number, number, number]
  background: [number, number, number, number]
  knowledge: [number, number, number, number]
  fact: [number, number, number, number]
  question: [number, number, number, number]
  example: [number, number, number, number]
  primary: [number, number, number, number]
  glow: [number, number, number, number]
}

/**
 * Convert HSL string to RGBA array
 * Input format: "217 91% 60%" (shadcn format without commas)
 */
function hslToRgba(hslString: string, alpha = 1): [number, number, number, number] {
  const parts = hslString.trim().split(/\s+/)
  if (parts.length < 3) {
    console.warn(`Invalid HSL string: "${hslString}", using fallback`)
    return [0.5, 0.5, 0.5, alpha]
  }

  const h = parseFloat(parts[0]) / 360
  const s = parseFloat(parts[1].replace('%', '')) / 100
  const l = parseFloat(parts[2].replace('%', '')) / 100

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [r, g, b, alpha]
}

/**
 * Get CSS variable value from document
 */
function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Extract theme colors from CSS variables
 * Call this when the page loads and when theme changes
 */
export function extractThemeColors(): ThemeColors {
  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark')

  // Card colors - use --popover for graph nodes as it's slightly lighter than --card
  // In most themes, --card === --background which makes nodes invisible
  const cardBgRaw = getCssVar('--popover') || getCssVar('--card')
  const cardBg = cardBgRaw || (isDark ? '0 0% 12%' : '0 0% 100%')

  const cardFg = getCssVar('--card-foreground') || '0 0% 98%'
  const border = getCssVar('--border') || '0 0% 15%'
  const background = getCssVar('--background') || '0 0% 4%'

  // Semantic colors - try to get from CSS, fallback to defaults
  const knowledge = getCssVar('--semantic-knowledge') || '217 91% 60%'   // blue
  const fact = getCssVar('--semantic-fact') || '142 71% 45%'             // green
  const question = getCssVar('--semantic-question') || '38 92% 50%'      // amber
  const example = getCssVar('--semantic-example') || '270 67% 47%'       // purple

  // UI colors
  const primary = getCssVar('--primary') || '217 91% 60%'

  return {
    card_bg: hslToRgba(cardBg),
    card_fg: hslToRgba(cardFg),
    border: hslToRgba(border),
    background: hslToRgba(background),
    knowledge: hslToRgba(knowledge),
    fact: hslToRgba(fact),
    question: hslToRgba(question),
    example: hslToRgba(example),
    primary: hslToRgba(primary),
    glow: hslToRgba(primary, 0.5), // Glow with 50% alpha
  }
}

/**
 * Convert theme to JSON for WASM
 */
export function themeToJson(): string {
  return JSON.stringify(extractThemeColors())
}

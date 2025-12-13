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
  knowledge: [number, number, number, number]
  fact: [number, number, number, number]
  question: [number, number, number, number]
  example: [number, number, number, number]
  primary: [number, number, number, number]
  glow: [number, number, number, number]
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
  let rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  let gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  let bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

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
  const cardBg = cardBgRaw || (isDark ? '0.19 0 0' : '0.995 0 0')

  const cardFg = getCssVar('--card-foreground') || (isDark ? '0.93 0 0' : '0.12 0 0')
  const border = getCssVar('--border') || (isDark ? '0.28 0 0' : '0.91 0 0')
  const background = getCssVar('--background') || (isDark ? '0.16 0 0' : '0.99 0 0')

  // Semantic colors - try to get from CSS, fallback to defaults (OKLCH)
  const knowledge = getCssVar('--semantic-knowledge') || '0.55 0.17 250' // blue
  const fact = getCssVar('--semantic-fact') || '0.58 0.17 145' // green
  const question = getCssVar('--semantic-question') || '0.55 0.19 290' // purple
  const example = getCssVar('--semantic-example') || '0.70 0.15 70' // amber

  // UI colors
  const primary = getCssVar('--primary') || (isDark ? '0.95 0 0' : '0.12 0 0')

  return {
    card_bg: oklchToRgba(cardBg),
    card_fg: oklchToRgba(cardFg),
    border: oklchToRgba(border),
    background: oklchToRgba(background),
    knowledge: oklchToRgba(knowledge),
    fact: oklchToRgba(fact),
    question: oklchToRgba(question),
    example: oklchToRgba(example),
    primary: oklchToRgba(primary),
    glow: oklchToRgba(primary, 0.5) // Glow with 50% alpha
  }
}

/**
 * Convert theme to JSON for WASM
 */
export function themeToJson(): string {
  return JSON.stringify(extractThemeColors())
}

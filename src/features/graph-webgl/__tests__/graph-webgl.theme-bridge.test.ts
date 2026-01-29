import { describe, expect, it, vi } from 'vitest'
import {
  cssVarToHex,
  extractThemeColors,
  getCssVar,
  getCssVarValue,
  getNodeColorHex,
  oklchToRgba,
  rgbaToHex,
  themeToJson
} from '../lib/theme-bridge'

describe('theme bridge helpers', () => {
  it('converts OKLCH to RGBA', () => {
    const rgba = oklchToRgba('0.5 0 0')
    expect(rgba).toHaveLength(4)
    expect(rgba[3]).toBe(1)
  })

  it('clamps srgb values for bright colors', () => {
    expect(oklchToRgba('1 0 0')).toEqual([1, 1, 1, 1])
  })

  it('falls back for invalid OKLCH strings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(oklchToRgba('bad')).toEqual([0.5, 0.5, 0.5, 1])
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('converts RGBA to hex', () => {
    expect(rgbaToHex([1, 1, 1, 1])).toBe('#ffffff')
  })

  it('reads css variable values', () => {
    document.documentElement.style.setProperty('--test-color', '0.5 0 0')
    expect(getCssVarValue('--test-color')).toBe('0.5 0 0')
  })

  it('converts css variables to hex', () => {
    document.documentElement.style.setProperty('--rating-novice', '0.5 0 0')
    const hex = cssVarToHex('rating-novice')
    expect(hex).not.toBe('#808080')
  })

  it('returns fallback hex when css variable is missing', () => {
    document.documentElement.style.removeProperty('--missing-var')
    expect(cssVarToHex('missing-var')).toBe('#808080')
  })

  it('extracts theme colors', () => {
    const colors = extractThemeColors()
    expect(colors.concept).toHaveLength(4)
    expect(colors.background).toHaveLength(4)
  })

  it('uses css variables when provided', () => {
    document.documentElement.style.setProperty('--popover', '0.2 0 0')
    document.documentElement.style.setProperty('--card-foreground', '0.9 0 0')
    document.documentElement.style.setProperty('--border', '0.3 0 0')
    document.documentElement.style.setProperty('--background', '0.1 0 0')
    document.documentElement.style.setProperty('--muted-foreground', '0.4 0 0')
    document.documentElement.style.setProperty('--primary', '0.8 0 0')

    const colors = extractThemeColors()
    expect(colors.card_bg).toHaveLength(4)
    expect(colors.primary).toHaveLength(4)

    document.documentElement.style.removeProperty('--popover')
    document.documentElement.style.removeProperty('--card-foreground')
    document.documentElement.style.removeProperty('--border')
    document.documentElement.style.removeProperty('--background')
    document.documentElement.style.removeProperty('--muted-foreground')
    document.documentElement.style.removeProperty('--primary')
  })

  it('uses dark mode fallbacks when css variables are missing', () => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.cssText = ''

    const colors = extractThemeColors()
    expect(colors.card_bg).toEqual(oklchToRgba('0.19 0 0'))
    expect(colors.card_fg).toEqual(oklchToRgba('0.93 0 0'))
    expect(colors.primary).toEqual(oklchToRgba('0.95 0 0'))

    document.documentElement.classList.remove('dark')
  })

  it('serializes theme and resolves node colors', () => {
    const json = themeToJson()
    expect(JSON.parse(json)).toBeTruthy()
    expect(getNodeColorHex('unknown-type')).toMatch(/^#/)
  })

  it('returns SSR fallbacks without browser globals', async () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('document', undefined)
    vi.resetModules()
    const mod = await import('../lib/theme-bridge')
    expect(mod.getCssVar('--test-color')).toBe('')
    expect(mod.getCssVarValue('--test-color')).toBe('')
    expect(mod.cssVarToHex('rating-novice')).toBe('#808080')
    expect(mod.extractThemeColors().card_bg).toHaveLength(4)
    vi.unstubAllGlobals()
  })
})

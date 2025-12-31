import { describe, expect, it } from 'vitest'
import {
  cssVarToHex,
  extractThemeColors,
  getCssVarValue,
  oklchToRgba,
  rgbaToHex
} from '../lib/theme-bridge'

describe('theme bridge helpers', () => {
  it('converts OKLCH to RGBA', () => {
    const rgba = oklchToRgba('0.5 0 0')
    expect(rgba).toHaveLength(4)
    expect(rgba[3]).toBe(1)
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

  it('extracts theme colors', () => {
    const colors = extractThemeColors()
    expect(colors.concept).toHaveLength(4)
    expect(colors.background).toHaveLength(4)
  })
})

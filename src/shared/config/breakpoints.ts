/**
 * Responsive Breakpoints Configuration
 *
 * Константы для адаптивной верстки, соответствуют Tailwind CSS breakpoints.
 * Используются для определения мобильной/десктопной версии в JS коде.
 */

/**
 * Точки перелома для responsive дизайна (в пикселях)
 *
 * Эти значения соответствуют стандартным breakpoints Tailwind CSS:
 * - sm: 640px - маленькие планшеты и большие телефоны
 * - md: 768px - планшеты в портретной ориентации
 * - lg: 1024px - планшеты в альбомной ориентации и маленькие ноутбуки
 * - xl: 1280px - обычные десктопы
 * - 2xl: 1536px - большие экраны
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Проверяет, является ли текущая ширина экрана мобильной (<768px)
 * @param width - ширина экрана в пикселях
 * @returns true если экран меньше md breakpoint
 */
export const isMobileWidth = (width: number): boolean => width < BREAKPOINTS.md

/**
 * Проверяет, является ли текущая ширина экрана планшетной (>=768px && <1024px)
 * @param width - ширина экрана в пикселях
 * @returns true если экран между md и lg breakpoints
 */
export const isTabletWidth = (width: number): boolean =>
  width >= BREAKPOINTS.md && width < BREAKPOINTS.lg

/**
 * Проверяет, является ли текущая ширина экрана десктопной (>=1024px)
 * @param width - ширина экрана в пикселях
 * @returns true если экран больше или равен lg breakpoint
 */
export const isDesktopWidth = (width: number): boolean => width >= BREAKPOINTS.lg

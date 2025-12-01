import type { RelationType } from '../model/edge.schema'

// HEX для SVG stroke
export const EDGE_STROKE_COLORS: Record<RelationType, string> = {
  prerequisite: '#f97316', // orange-500
  causes: '#ef4444', // red-500
  explains: '#8b5cf6', // violet-500
  'is-a': '#6366f1', // indigo-500
  'has-a': '#10b981', // emerald-500
  'part-of': '#14b8a6', // teal-500
  influences: '#f59e0b', // amber-500
  'related-to': '#64748b', // slate-500
  contradicts: '#dc2626', // red-600
  'similar-to': '#84cc16' // lime-500
}

// Tailwind классы для badge
export const EDGE_BADGE_CLASSES: Record<RelationType, string> = {
  prerequisite:
    'bg-orange-200 text-orange-800 border-transparent dark:bg-orange-950/50 dark:text-orange-300',
  causes: 'bg-red-200 text-red-800 border-transparent dark:bg-red-950/50 dark:text-red-300',
  explains:
    'bg-violet-200 text-violet-800 border-transparent dark:bg-violet-950/50 dark:text-violet-300',
  'is-a':
    'bg-indigo-200 text-indigo-800 border-transparent dark:bg-indigo-950/50 dark:text-indigo-300',
  'has-a':
    'bg-emerald-200 text-emerald-800 border-transparent dark:bg-emerald-950/50 dark:text-emerald-300',
  'part-of':
    'bg-teal-200 text-teal-800 border-transparent dark:bg-teal-950/50 dark:text-teal-300',
  influences:
    'bg-amber-200 text-amber-800 border-transparent dark:bg-amber-950/50 dark:text-amber-300',
  'related-to':
    'bg-slate-200 text-slate-800 border-transparent dark:bg-slate-950/50 dark:text-slate-300',
  contradicts:
    'bg-red-300 text-red-900 border-transparent dark:bg-red-900/50 dark:text-red-200',
  'similar-to':
    'bg-lime-200 text-lime-800 border-transparent dark:bg-lime-950/50 dark:text-lime-300'
}

export const getEdgeStrokeColor = (type: RelationType) =>
  EDGE_STROKE_COLORS[type] || '#64748b'

export const getEdgeBadgeClass = (type: RelationType) =>
  EDGE_BADGE_CLASSES[type] || 'bg-slate-200 text-slate-800 border-transparent'

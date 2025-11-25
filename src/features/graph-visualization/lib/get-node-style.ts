import {
  Brain,
  FileText,
  HelpCircle,
  Lightbulb,
  Target,
  Zap,
  type LucideIcon
} from 'lucide-react'

type NodeType = 'concept' | 'fact' | 'theory' | 'example' | 'question' | 'hypothesis'

export function getNodeBorderColor(type: NodeType): string {
  const colors: Record<NodeType, string> = {
    concept: 'border-l-blue-500',
    theory: 'border-l-purple-500',
    fact: 'border-l-emerald-500',
    example: 'border-l-amber-500',
    question: 'border-l-rose-500',
    hypothesis: 'border-l-cyan-500'
  }
  return colors[type] || 'border-l-slate-500'
}

export function getNodeIcon(type: NodeType): LucideIcon {
  const icons: Record<NodeType, LucideIcon> = {
    concept: Brain,
    fact: FileText,
    theory: Lightbulb,
    example: Target,
    question: HelpCircle,
    hypothesis: Zap
  }
  return icons[type] || Brain
}

export function getComplexityColor(
  complexity?: 'basic' | 'intermediate' | 'advanced'
): string {
  if (!complexity) return ''

  const colors = {
    basic: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200',
    advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200'
  }
  return colors[complexity]
}

import {
  Brain,
  FileText,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  type LucideIcon,
  Target,
  User,
  Zap
} from 'lucide-react'
import type { NodeType } from '@/entities/node'

export function getNodeBorderColor(type: NodeType): string {
  const colors: Record<NodeType, string> = {
    concept: 'border-l-blue-500',
    theory: 'border-l-purple-500',
    fact: 'border-l-emerald-500',
    example: 'border-l-amber-500',
    question: 'border-l-rose-500',
    hypothesis: 'border-l-cyan-500',
    person: 'border-l-orange-500',
    school: 'border-l-indigo-500'
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
    hypothesis: Zap,
    person: User,
    school: GraduationCap
  }
  return icons[type] || Brain
}

export function getComplexityColor(complexity?: 'basic' | 'intermediate' | 'advanced'): string {
  if (!complexity) return ''

  const colors = {
    basic: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    intermediate: 'bg-blue-200 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    advanced: 'bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
  }
  return colors[complexity]
}

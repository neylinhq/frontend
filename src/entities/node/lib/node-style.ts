import type { NodeType } from '../node.schema'

/**
 * S+ Elite Semantic Color System
 * - Knowledge (concept, theory): Blue
 * - Fact: Green
 * - Question (question, hypothesis): Purple
 * - Example (example, person, school): Amber
 * Uses CSS variables that adapt to palette (mono/classic/vanilla/vivid)
 */
export const getNodeBorderColor = (type: NodeType): string => {
  const colors: Record<NodeType, string> = {
    // Knowledge group - Blue
    concept: 'border-l-semantic-knowledge',
    theory: 'border-l-semantic-knowledge',
    // Fact group - Green
    fact: 'border-l-semantic-fact',
    // Question group - Purple
    question: 'border-l-semantic-question',
    hypothesis: 'border-l-semantic-question',
    // Example group - Amber
    example: 'border-l-semantic-example',
    person: 'border-l-semantic-example',
    school: 'border-l-semantic-example'
  }
  return colors[type] || 'border-l-semantic-neutral'
}

/**
 * Complexity colors using semantic system
 * - Basic: Neutral (gray)
 * - Intermediate: Knowledge (blue)
 * - Advanced: Conflict (red) - signals difficulty
 */
export const getComplexityColor = (complexity?: 'basic' | 'intermediate' | 'advanced'): string => {
  if (!complexity) {
    return ''
  }

  const colors = {
    basic: 'bg-complexity-basic-bg text-complexity-basic',
    intermediate: 'bg-complexity-intermediate-bg text-complexity-intermediate',
    advanced: 'bg-complexity-advanced-bg text-complexity-advanced'
  }
  return colors[complexity]
}

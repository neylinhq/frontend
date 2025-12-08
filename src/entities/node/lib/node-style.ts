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
 * Background color for LOD view (zoomed out)
 * Uses muted semantic colors for softer appearance
 */
export const getNodeBgColor = (type: NodeType): string => {
  const colors: Record<NodeType, string> = {
    // Knowledge group - Blue
    concept: 'bg-semantic-knowledge-muted',
    theory: 'bg-semantic-knowledge-muted',
    // Fact group - Green
    fact: 'bg-semantic-fact-muted',
    // Question group - Purple
    question: 'bg-semantic-question-muted',
    hypothesis: 'bg-semantic-question-muted',
    // Example group - Amber
    example: 'bg-semantic-example-muted',
    person: 'bg-semantic-example-muted',
    school: 'bg-semantic-example-muted'
  }
  return colors[type] || 'bg-semantic-neutral-muted'
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

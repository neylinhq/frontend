import type { NodeType } from '@/entities/node'

const NODE_TYPE_ALIASES: Record<string, NodeType> = {
  concept: 'concept',
  c: 'concept',
  fact: 'fact',
  f: 'fact',
  theory: 'theory',
  t: 'theory',
  example: 'example',
  e: 'example',
  question: 'question',
  q: 'question',
  hypothesis: 'hypothesis',
  h: 'hypothesis',
  person: 'person',
  p: 'person',
  school: 'school',
  s: 'school'
}

export interface ParsedQuickInput {
  label: string
  type: NodeType
}

/**
 * Parses quick input with optional /type suffix
 *
 * @example
 * parseQuickInput("Quantum mechanics")
 * // { label: "Quantum mechanics", type: "concept" }
 *
 * parseQuickInput("Albert Einstein /person")
 * // { label: "Albert Einstein", type: "person" }
 *
 * parseQuickInput("Why is the sky blue? /q")
 * // { label: "Why is the sky blue?", type: "question" }
 */
export const parseQuickInput = (
  input: string,
  defaultType: NodeType = 'concept'
): ParsedQuickInput => {
  const trimmed = input.trim()

  // Match pattern: "label /type" where type is at the end
  const match = trimmed.match(/^(.+?)\s*\/(\w+)$/)

  if (match) {
    const [, labelPart, typePart] = match
    const label = labelPart.trim()
    const typeKey = typePart.toLowerCase()
    const type = NODE_TYPE_ALIASES[typeKey] ?? defaultType

    return { label, type }
  }

  return { label: trimmed, type: defaultType }
}

/**
 * Returns list of type suggestions for autocomplete
 */
export const getTypeSuggestions = (query: string): NodeType[] => {
  const q = query.toLowerCase()

  if (!q) {
    return Object.values(NODE_TYPE_ALIASES).filter(
      (type, index, arr) => arr.indexOf(type) === index
    )
  }

  const matches = new Set<NodeType>()

  for (const [alias, type] of Object.entries(NODE_TYPE_ALIASES)) {
    if (alias.startsWith(q)) {
      matches.add(type)
    }
  }

  return Array.from(matches)
}

/**
 * Checks if input currently has a type suffix being typed
 */
export const hasTypePrefix = (input: string): boolean => {
  return /\/\w*$/.test(input)
}

/**
 * Extracts the partial type being typed after /
 */
export const getPartialType = (input: string): string | null => {
  const match = input.match(/\/(\w*)$/)
  return match ? match[1] : null
}

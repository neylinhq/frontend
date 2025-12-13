import type { Node, LightweightNode } from '@/entities/node'
import type { UserNodeProgress } from './progress.schema'
import { DEFAULT_NODE_PROGRESS } from './progress.schema'

/**
 * EnrichedNode combines objective node data with user's personal progress.
 * Use this type in UI components that need to display both content and progress.
 */
export type EnrichedNode = Node & {
  progress: UserNodeProgress
}

export type EnrichedLightweightNode = LightweightNode & {
  progress: UserNodeProgress
}

/**
 * Merge nodes with user progress data.
 * Nodes without explicit progress get default values.
 */
export function enrichNodesWithProgress<T extends Node | LightweightNode>(
  nodes: T[],
  progressList: UserNodeProgress[]
): (T & { progress: UserNodeProgress })[] {
  const progressMap = new Map(progressList.map(p => [p.nodeId, p]))

  return nodes.map(node => ({
    ...node,
    progress: progressMap.get(node.id) ?? {
      ...DEFAULT_NODE_PROGRESS,
      id: '',
      userId: '',
      nodeId: node.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }))
}

/**
 * Get progress stats for a list of enriched nodes.
 */
export function getProgressStats(nodes: EnrichedNode[] | EnrichedLightweightNode[]) {
  const total = nodes.length
  const mastered = nodes.filter(n => n.progress.masteryLevel === 'mastered').length
  const learning = nodes.filter(n =>
    n.progress.masteryLevel === 'learning' || n.progress.masteryLevel === 'practicing'
  ).length
  const notStarted = nodes.filter(n => n.progress.masteryLevel === 'not_started').length
  const bookmarked = nodes.filter(n => n.progress.isBookmarked).length

  const avgConfidence = total > 0
    ? nodes.reduce((sum, n) => sum + n.progress.confidence, 0) / total
    : 0

  return {
    total,
    mastered,
    learning,
    notStarted,
    bookmarked,
    avgConfidence,
    masteryPercent: total > 0 ? (mastered / total) * 100 : 0
  }
}

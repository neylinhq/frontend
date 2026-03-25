'use client'

import { Loading02Icon } from '@untitledui/icons-react/outline'

import type { Edge, Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'

import {
  usePracticeModeStore,
  usePracticeView,
} from '../model/practice-mode.store'
import { PracticeNodeDetail } from './practice-node-detail'
import { PracticeOverview } from './practice-overview'
import { PracticeSessionEnd } from './practice-session-end'

interface PracticeModePanelProps {
  mapId: string
  /** All nodes on the map (for node detail prereqs/dependents) */
  nodes?: Node[]
  /** All edges on the map */
  edges?: Edge[]
  /** Currently selected node (from graph click) */
  selectedNode?: Node | null
  className?: string
}

/**
 * PracticeModePanel routes between 4 view states:
 * - overview: mastery stats, session launchers
 * - node_detail: selected node memory info, prereqs
 * - exercise: active exercise (rendered by parent, this panel shows progress)
 * - session_end: session summary with stability deltas
 */
export const PracticeModePanel = ({
  selectedNode,
  nodes = [],
  edges = [],
  className,
}: PracticeModePanelProps) => {
  const view = usePracticeView()
  const isLoading = usePracticeModeStore((s) => s.isLoadingMastery)

  if (isLoading) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <Loading02Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  switch (view) {
    case 'overview':
      return (
        <PracticeOverview
          className={className}
        />
      )

    case 'node_detail':
      if (!selectedNode) {
        return <PracticeOverview className={className} />
      }
      return (
        <PracticeNodeDetail
          node={selectedNode}
          edges={edges}
          allNodes={nodes}
          className={className}
        />
      )

    case 'exercise':
      return null

    case 'session_end':
      return <PracticeSessionEnd className={className} />

    default:
      return null
  }
}

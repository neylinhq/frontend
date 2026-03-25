'use client'

import { Loading02Icon } from '@untitledui/icons-react/outline'

import type { Edge, Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'

import {
  usePracticeModeStore,
  usePracticeView,
} from '../model/practice-mode.store'
import { ExerciseView } from './exercise-view'
import { PracticeOverview } from './practice-overview'
import { PracticeSessionEnd } from './practice-session-end'
import { TutorChatPlaceholder } from './tutor-chat-placeholder'

interface PracticeModePanelProps {
  mapId: string
  /** All nodes on the map (for node labels in exercise view) */
  nodes?: Node[]
  /** @deprecated No longer used — kept for backward compatibility */
  edges?: Edge[]
  /** @deprecated No longer used — kept for backward compatibility */
  selectedNode?: Node | null
  className?: string
}

/**
 * PracticeModePanel routes between view states:
 * - overview: scope-aware mastery stats, session launchers
 * - tutor: Socratic tutor chat (placeholder)
 * - review: active exercise flow
 * - session_end: session summary with stability deltas
 */
export const PracticeModePanel = ({
  mapId,
  nodes = [],
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
    case 'overview': {
      return <PracticeOverview mapId={mapId} className={className} />
    }

    case 'tutor': {
      return <TutorChatPlaceholder className={className} />
    }

    case 'review': {
      const nodeLabels = new Map<string, string>()
      for (const n of nodes) {
        nodeLabels.set(n.id, n.label ?? n.id.slice(0, 8))
      }
      return <ExerciseView mapId={mapId} nodeLabels={nodeLabels} className={className} />
    }

    case 'session_end': {
      return <PracticeSessionEnd className={className} />
    }

    default: {
      return null
    }
  }
}

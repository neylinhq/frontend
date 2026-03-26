'use client'

import type { Edge, Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'

import {
  usePracticeModeStore,
  usePracticeView,
} from '../model/practice-mode.store'
import { ExerciseView } from './exercise-view'
import { PracticeOverview } from './practice-overview'
import { PracticeSessionEnd } from './practice-session-end'
import { TutorChatView } from './tutor-chat-view'

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
  const session = usePracticeModeStore((s) => s.session)

  // Guard: if view requires session but session is null, reset to overview
  const effectiveView = (view === 'tutor' || view === 'review') && !session ? 'overview' : view

  switch (effectiveView) {
    case 'overview': {
      return <PracticeOverview mapId={mapId} className={className} />
    }

    case 'tutor': {
      const tutorNodeLabels = new Map<string, string>()
      for (const n of nodes) {
        tutorNodeLabels.set(n.id, n.label ?? n.id.slice(0, 8))
      }
      return <TutorChatView mapId={mapId} nodeLabels={tutorNodeLabels} className={className} />
    }

    case 'review': {
      const nodeLabels = new Map<string, string>()
      for (const n of nodes) {
        nodeLabels.set(n.id, n.label ?? n.id.slice(0, 8))
      }
      return <ExerciseView mapId={mapId} nodeLabels={nodeLabels} className={className} />
    }

    case 'session_end': {
      return <PracticeSessionEnd mapId={mapId} className={className} />
    }

    default: {
      return null
    }
  }
}

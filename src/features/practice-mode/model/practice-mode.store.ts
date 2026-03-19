import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import type { MasteryLevel, UserNodeProgress } from '@/entities/progress'

/**
 * Mastery data for a single node, derived from UserNodeProgress.
 */
export interface NodeMasteryData {
  nodeId: string
  mastery: MasteryLevel
  confidence: number
  isDue: boolean
  nextReviewAt: string | null
}

/**
 * Practice session state — tracks an active quick session or deep dive.
 */
export interface PracticeSession {
  type: 'quick' | 'deep'
  /** Currently active node in the session */
  activeNodeId: string | null
  /** Ordered list of node IDs to practice */
  nodeQueue: string[]
  /** Current index in the queue */
  currentIndex: number
  /** Answers this session: nodeId → correct */
  results: Map<string, boolean>
}

export interface PracticeModeState {
  /** Whether practice mode is active */
  isActive: boolean
  /** Node mastery map: nodeId → mastery data (populated from API) */
  masteryMap: Map<string, NodeMasteryData>
  /** Active practice session (null when idle in practice mode) */
  session: PracticeSession | null
  /** Whether mastery data is loading */
  isLoadingMastery: boolean
}

export interface PracticeModeActions {
  /** Enter practice mode */
  enter: () => void
  /** Exit practice mode */
  exit: () => void
  /** Set mastery data from API response */
  setMasteryData: (progress: UserNodeProgress[]) => void
  /** Set loading state */
  setLoadingMastery: (loading: boolean) => void
  /** Start a quick session with node queue */
  startQuickSession: (nodeIds: string[]) => void
  /** Start a deep dive on a specific node */
  startDeepDive: (nodeId: string) => void
  /** Record answer and advance session */
  recordAnswer: (nodeId: string, correct: boolean) => void
  /** Move to next exercise in session */
  nextExercise: () => void
  /** End active session */
  endSession: () => void
  /** Update mastery for a single node (after answer) */
  updateNodeMastery: (nodeId: string, mastery: MasteryLevel, confidence: number) => void
}

const isNodeDue = (progress: UserNodeProgress): boolean => {
  if (!progress.nextReviewAt) return false
  return new Date(progress.nextReviewAt) <= new Date()
}

export const usePracticeModeStore = create<PracticeModeState & PracticeModeActions>()(
  (set, get) => ({
    // State
    isActive: false,
    masteryMap: new Map(),
    session: null,
    isLoadingMastery: false,

    // Actions
    enter: () => set({ isActive: true }),

    exit: () =>
      set({
        isActive: false,
        session: null
      }),

    setMasteryData: (progress) => {
      const map = new Map<string, NodeMasteryData>()
      for (const p of progress) {
        map.set(p.nodeId, {
          nodeId: p.nodeId,
          mastery: p.masteryLevel,
          confidence: p.confidence,
          isDue: isNodeDue(p),
          nextReviewAt: p.nextReviewAt ?? null
        })
      }
      set({ masteryMap: map, isLoadingMastery: false })
    },

    setLoadingMastery: (loading) => set({ isLoadingMastery: loading }),

    startQuickSession: (nodeIds) =>
      set({
        session: {
          type: 'quick',
          activeNodeId: nodeIds[0] ?? null,
          nodeQueue: nodeIds,
          currentIndex: 0,
          results: new Map()
        }
      }),

    startDeepDive: (nodeId) =>
      set({
        session: {
          type: 'deep',
          activeNodeId: nodeId,
          nodeQueue: [nodeId],
          currentIndex: 0,
          results: new Map()
        }
      }),

    recordAnswer: (nodeId, correct) => {
      const { session } = get()
      if (!session) return

      const results = new Map(session.results)
      results.set(nodeId, correct)
      set({ session: { ...session, results } })
    },

    nextExercise: () => {
      const { session } = get()
      if (!session) return

      const nextIndex = session.currentIndex + 1
      if (nextIndex >= session.nodeQueue.length) {
        // Session complete — keep session for summary
        return
      }

      set({
        session: {
          ...session,
          currentIndex: nextIndex,
          activeNodeId: session.nodeQueue[nextIndex]
        }
      })
    },

    endSession: () => set({ session: null }),

    updateNodeMastery: (nodeId, mastery, confidence) => {
      const { masteryMap } = get()
      const existing = masteryMap.get(nodeId)
      const updated = new Map(masteryMap)
      updated.set(nodeId, {
        nodeId,
        mastery,
        confidence,
        isDue: false, // just answered — not due
        nextReviewAt: existing?.nextReviewAt ?? null
      })
      set({ masteryMap: updated })
    }
  })
)

// --- Selector hooks ---

export const usePracticeModeActive = () => usePracticeModeStore((s) => s.isActive)

export const usePracticeModeSession = () => usePracticeModeStore((s) => s.session)

export const useMasteryMap = () => usePracticeModeStore((s) => s.masteryMap)

export const useNodeMastery = (nodeId: string) =>
  usePracticeModeStore((s) => s.masteryMap.get(nodeId))

export const usePracticeModeActions = () =>
  usePracticeModeStore(
    useShallow((s) => ({
      enter: s.enter,
      exit: s.exit,
      setMasteryData: s.setMasteryData,
      setLoadingMastery: s.setLoadingMastery,
      startQuickSession: s.startQuickSession,
      startDeepDive: s.startDeepDive,
      recordAnswer: s.recordAnswer,
      nextExercise: s.nextExercise,
      endSession: s.endSession,
      updateNodeMastery: s.updateNodeMastery
    }))
  )

export const usePracticeModeStats = () =>
  usePracticeModeStore(
    useShallow((s) => {
      const mastery = s.masteryMap
      let mastered = 0
      let learning = 0
      let practicing = 0
      let notStarted = 0
      let dueCount = 0

      for (const data of mastery.values()) {
        switch (data.mastery) {
          case 'mastered':
            mastered++
            break
          case 'practicing':
            practicing++
            break
          case 'learning':
            learning++
            break
          case 'not_started':
            notStarted++
            break
        }
        if (data.isDue) dueCount++
      }

      return {
        total: mastery.size,
        mastered,
        learning,
        practicing,
        notStarted,
        dueCount
      }
    })
  )

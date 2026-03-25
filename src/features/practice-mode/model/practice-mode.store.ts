import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import type { MasteryLevel, UserNodeProgress } from '@/entities/progress'

// --- Types ---

export type SessionType = 'review' | 'learn' | 'deep_dive' | 'challenge'

/** Practice sidebar view state */
export type PracticeView = 'overview' | 'node_detail' | 'exercise' | 'session_end'

export interface NodeMasteryData {
  nodeId: string
  mastery: MasteryLevel
  confidence: number
  isDue: boolean
  nextReviewAt: string | null
  fsrsStability: number
  fsrsDifficulty: number
  effectiveStability: number
  prereqsStable: boolean
  reviewCount: number
}

export interface StabilityDelta {
  nodeId: string
  nodeLabel: string
  before: number
  after: number
  delta: number
}

export interface PracticeSession {
  type: SessionType
  nodeQueue: string[]
  currentIndex: number
  results: Map<string, boolean>
  stabilityDeltas: StabilityDelta[]
  startedAt: number
}

export interface PracticeModeState {
  isActive: boolean
  view: PracticeView
  selectedNodeId: string | null
  masteryMap: Map<string, NodeMasteryData>
  session: PracticeSession | null
  isLoadingMastery: boolean
}

export interface PracticeModeActions {
  enter: () => void
  exit: () => void
  setView: (view: PracticeView) => void
  selectNode: (nodeId: string | null) => void
  setMasteryData: (progress: UserNodeProgress[]) => void
  setLoadingMastery: (loading: boolean) => void
  startSession: (type: SessionType, nodeIds: string[]) => void
  recordAnswer: (nodeId: string, correct: boolean, stabilityDelta?: StabilityDelta) => void
  nextExercise: () => void
  endSession: () => void
  updateNodeMastery: (nodeId: string, data: Partial<NodeMasteryData>) => void
}

// --- Store ---

export const usePracticeModeStore = create<PracticeModeState & PracticeModeActions>()(
  (set, get) => ({
    isActive: false,
    view: 'overview',
    selectedNodeId: null,
    masteryMap: new Map(),
    session: null,
    isLoadingMastery: false,

    enter: () => set({ isActive: true, view: 'overview' }),

    exit: () =>
      set({
        isActive: false,
        view: 'overview',
        session: null,
        selectedNodeId: null,
      }),

    setView: (view) => set({ view }),

    selectNode: (nodeId) => {
      if (nodeId) {
        set({ selectedNodeId: nodeId, view: 'node_detail' })
      } else {
        set({ selectedNodeId: null, view: 'overview' })
      }
    },

    setMasteryData: (progress) => {
      const map = new Map<string, NodeMasteryData>()
      for (const p of progress) {
        map.set(p.nodeId, {
          nodeId: p.nodeId,
          mastery: p.masteryLevel,
          confidence: p.confidence,
          isDue: p.reviewCount > 0 && isNodeDue(p),
          nextReviewAt: p.nextReviewAt ?? null,
          fsrsStability: p.fsrsStability,
          fsrsDifficulty: p.fsrsDifficulty,
          effectiveStability: p.effectiveStability,
          prereqsStable: p.prereqsStable,
          reviewCount: p.reviewCount,
        })
      }
      set({ masteryMap: map, isLoadingMastery: false })
    },

    setLoadingMastery: (loading) => set({ isLoadingMastery: loading }),

    startSession: (type, nodeIds) =>
      set({
        view: 'exercise',
        session: {
          type,
          nodeQueue: nodeIds,
          currentIndex: 0,
          results: new Map(),
          stabilityDeltas: [],
          startedAt: Date.now(),
        },
      }),

    recordAnswer: (nodeId, correct, stabilityDelta) => {
      const { session } = get()
      if (!session) return

      const results = new Map(session.results)
      results.set(nodeId, correct)
      const deltas = stabilityDelta
        ? [...session.stabilityDeltas, stabilityDelta]
        : session.stabilityDeltas

      set({ session: { ...session, results, stabilityDeltas: deltas } })
    },

    nextExercise: () => {
      const { session } = get()
      if (!session) return

      const nextIndex = session.currentIndex + 1
      if (nextIndex >= session.nodeQueue.length) {
        set({ view: 'session_end' })
        return
      }

      set({
        session: {
          ...session,
          currentIndex: nextIndex,
        },
      })
    },

    endSession: () => set({ session: null, view: 'overview' }),

    updateNodeMastery: (nodeId, data) => {
      const { masteryMap } = get()
      const existing = masteryMap.get(nodeId)
      if (!existing) return
      const updated = new Map(masteryMap)
      updated.set(nodeId, { ...existing, ...data })
      set({ masteryMap: updated })
    },
  })
)

// --- Helpers ---

function isNodeDue(p: UserNodeProgress): boolean {
  if (!p.nextReviewAt) return false
  return new Date(p.nextReviewAt) <= new Date()
}

// --- Selector hooks ---

export const usePracticeModeActive = () => usePracticeModeStore((s) => s.isActive)

export const usePracticeView = () => usePracticeModeStore((s) => s.view)

export const usePracticeModeSession = () => usePracticeModeStore((s) => s.session)

export const useSelectedPracticeNodeId = () => usePracticeModeStore((s) => s.selectedNodeId)

export const useMasteryMap = () => usePracticeModeStore((s) => s.masteryMap)

export const useNodeMastery = (nodeId: string) =>
  usePracticeModeStore((s) => s.masteryMap.get(nodeId))

export const usePracticeModeActions = () =>
  usePracticeModeStore(
    useShallow((s) => ({
      enter: s.enter,
      exit: s.exit,
      setView: s.setView,
      selectNode: s.selectNode,
      setMasteryData: s.setMasteryData,
      setLoadingMastery: s.setLoadingMastery,
      startSession: s.startSession,
      recordAnswer: s.recordAnswer,
      nextExercise: s.nextExercise,
      endSession: s.endSession,
      updateNodeMastery: s.updateNodeMastery,
    }))
  )

export const usePracticeModeStats = () =>
  usePracticeModeStore(
    useShallow((s) => {
      const mastery = s.masteryMap
      let mastered = 0
      let proficient = 0
      let practicing = 0
      let learning = 0
      let notStarted = 0
      let dueCount = 0

      for (const data of mastery.values()) {
        switch (data.mastery) {
          case 'mastered':
            mastered++
            break
          case 'proficient':
            proficient++
            break
          case 'practicing':
            practicing++
            break
          case 'learning':
            learning++
            break
          case 'unlearned':
            notStarted++
            break
        }
        if (data.isDue) dueCount++
      }

      return {
        total: mastery.size,
        mastered,
        proficient,
        practicing,
        learning,
        notStarted,
        dueCount,
      }
    })
  )

/** Nodes on the ZPD frontier: unlearned with stable prerequisites */
export const useZPDFrontierCount = () =>
  usePracticeModeStore((s) => {
    let count = 0
    for (const data of s.masteryMap.values()) {
      if (data.mastery === 'unlearned' && data.prereqsStable) {
        count++
      }
    }
    return count
  })

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import type { MasteryLevel, UserNodeProgress } from '@/entities/progress'

// --- Types ---

export type PracticeView = 'overview' | 'tutor' | 'review' | 'session_end'

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

export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface PracticeSession {
  mode: 'tutor' | 'review'
  chain: string[]
  currentChainIndex: number
  results: Map<string, boolean>
  stabilityDeltas: StabilityDelta[]
  startedAt: number
  tutorHistory: TutorMessage[]
}

export interface PracticeModeState {
  view: PracticeView
  scopeNodeIds: string[]
  masteryMap: Map<string, NodeMasteryData>
  session: PracticeSession | null
  isLoadingMastery: boolean
}

export interface PracticeModeActions {
  enter: () => void
  exit: () => void
  setView: (view: PracticeView) => void
  setMasteryData: (progress: UserNodeProgress[]) => void
  setLoadingMastery: (loading: boolean) => void
  setScopeNodeIds: (nodeIds: string[]) => void
  startTutorSession: (chain: string[]) => void
  startReviewSession: (chain: string[]) => void
  addTutorMessage: (msg: TutorMessage) => void
  advanceChain: () => void
  recordAnswer: (nodeId: string, correct: boolean, stabilityDelta?: StabilityDelta) => void
  endSession: () => void
  updateNodeMastery: (nodeId: string, data: Partial<NodeMasteryData>) => void
  /** @deprecated No longer navigates to node_detail — kept as no-op for backward compatibility */
  selectNode: (nodeId: string | null) => void
}

// --- Store ---

export const usePracticeModeStore = create<PracticeModeState & PracticeModeActions>()(
  (set, get) => ({
    view: 'overview',
    scopeNodeIds: [],
    masteryMap: new Map(),
    session: null,
    isLoadingMastery: false,

    enter: () => set({ view: 'overview' }),

    exit: () =>
      set({
        view: 'overview',
        session: null,
        scopeNodeIds: [],
        masteryMap: new Map(),
      }),

    setView: (view) => set({ view }),

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

    setScopeNodeIds: (nodeIds) => set({ scopeNodeIds: nodeIds }),

    startTutorSession: (chain) =>
      set({
        view: 'tutor',
        session: {
          mode: 'tutor',
          chain,
          currentChainIndex: 0,
          results: new Map(),
          stabilityDeltas: [],
          startedAt: Date.now(),
          tutorHistory: [],
        },
      }),

    startReviewSession: (chain) =>
      set({
        view: 'review',
        session: {
          mode: 'review',
          chain,
          currentChainIndex: 0,
          results: new Map(),
          stabilityDeltas: [],
          startedAt: Date.now(),
          tutorHistory: [],
        },
      }),

    addTutorMessage: (msg) => {
      const { session } = get()
      if (!session) {
        return
      }
      set({
        session: {
          ...session,
          tutorHistory: [...session.tutorHistory, msg],
        },
      })
    },

    advanceChain: () => {
      const { session } = get()
      if (!session) {
        return
      }

      const nextIndex = session.currentChainIndex + 1
      if (nextIndex >= session.chain.length) {
        set({ view: 'session_end' })
        return
      }

      set({
        session: {
          ...session,
          currentChainIndex: nextIndex,
          tutorHistory: [],
        },
      })
    },

    recordAnswer: (nodeId, correct, stabilityDelta) => {
      const { session } = get()
      if (!session) {
        return
      }

      const results = new Map(session.results)
      results.set(nodeId, correct)
      const deltas = stabilityDelta
        ? [...session.stabilityDeltas, stabilityDelta]
        : session.stabilityDeltas

      set({ session: { ...session, results, stabilityDeltas: deltas } })
    },

    endSession: () => set({ session: null, view: 'overview' }),

    updateNodeMastery: (nodeId, data) => {
      const { masteryMap } = get()
      const existing = masteryMap.get(nodeId)
      if (!existing) {
        return
      }
      const updated = new Map(masteryMap)
      updated.set(nodeId, { ...existing, ...data })
      set({ masteryMap: updated })
    },

    selectNode: () => {
      // No-op: node_detail view removed in v2
    },
  })
)

// --- Helpers ---

function isNodeDue(p: UserNodeProgress): boolean {
  if (!p.nextReviewAt) return false
  return new Date(p.nextReviewAt) <= new Date()
}

// --- Selector hooks ---

export const usePracticeView = () => usePracticeModeStore((s) => s.view)

export const usePracticeModeSession = () => usePracticeModeStore((s) => s.session)

export const useMasteryMap = () => usePracticeModeStore((s) => s.masteryMap)

export const useNodeMastery = (nodeId: string) =>
  usePracticeModeStore((s) => s.masteryMap.get(nodeId))

export const usePracticeModeActions = () =>
  usePracticeModeStore(
    useShallow((s) => ({
      enter: s.enter,
      exit: s.exit,
      setView: s.setView,
      setMasteryData: s.setMasteryData,
      setLoadingMastery: s.setLoadingMastery,
      setScopeNodeIds: s.setScopeNodeIds,
      startTutorSession: s.startTutorSession,
      startReviewSession: s.startReviewSession,
      addTutorMessage: s.addTutorMessage,
      advanceChain: s.advanceChain,
      recordAnswer: s.recordAnswer,
      endSession: s.endSession,
      updateNodeMastery: s.updateNodeMastery,
      selectNode: s.selectNode,
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

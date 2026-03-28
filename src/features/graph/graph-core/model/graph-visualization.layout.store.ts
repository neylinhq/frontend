import { create } from 'zustand'

import type { LayoutPosition } from './graph.types'

interface LayoutState {
  layoutPositions: LayoutPosition[]
  setLayoutPositions: (layoutPositions: LayoutPosition[]) => void
}

export const useLayoutStore = create<LayoutState>()(set => ({
  layoutPositions: [],
  setLayoutPositions: layoutPositions => set({ layoutPositions })
}))

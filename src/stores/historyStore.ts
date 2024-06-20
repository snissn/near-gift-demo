"use client"

import { createStore } from "zustand/vanilla"

export type HistoryData = {
  defuseClientId: string
  status: string
  hash: string
  logs: string[]
}

export type HistoryState = {
  active: boolean
  data: Set<HistoryData>
}

export type HistoryActions = {
  openWidget: () => void
  closeWidget: () => void
  toggleWidget: () => void
  updateHistory: (data: HistoryData[]) => void
}

export type HistoryStore = HistoryState & HistoryActions

export const initHistoryStore = (): HistoryState => {
  return { active: false, data: new Set() }
}
export const defaultInitState: HistoryState = {
  active: false,
  data: new Set(),
}

export const createHistoryStore = (
  initState: HistoryState = defaultInitState
) => {
  return createStore<HistoryStore>()((set) => ({
    ...initState,
    openWidget: () => set({ active: true }),
    closeWidget: () => set({ active: false }),
    toggleWidget: () => set((state) => ({ active: !state.active })),
    updateHistory: (data: HistoryData[]) => set({ data: new Set(data) }),
  }))
}

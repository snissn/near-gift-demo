"use client"

import { createStore } from "zustand/vanilla"

import type { NetworkTokenWithSwapRoute } from "@src/types/interfaces"

export type TokensState = {
  data: Map<string, NetworkTokenWithSwapRoute>
  isLoading: boolean
}

export type TokensActions = {
  updateTokens: (data: NetworkTokenWithSwapRoute[]) => void
  triggerTokenUpdate: () => void
}

export type TokensStore = TokensState & TokensActions

export const initTokensStore = (): TokensState => {
  return {
    data: new Map(),
    isLoading: false,
  }
}

export const defaultInitState: TokensState = {
  data: new Map(),
  isLoading: false,
}

export const createTokensStore = (
  initState: TokensState = defaultInitState
) => {
  return createStore<TokensStore>()((set) => ({
    ...initState,
    updateTokens: (data: NetworkTokenWithSwapRoute[]) =>
      set((state) => {
        const updatedData = new Map(state.data)
        for (const item of data) updatedData.set(item.defuse_asset_id, item)
        return { data: updatedData, isLoading: false }
      }),
    triggerTokenUpdate: () => set((state) => ({ ...state, isLoading: true })),
  }))
}

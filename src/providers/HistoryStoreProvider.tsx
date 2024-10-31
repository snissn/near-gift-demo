"use client"

import { type ReactNode, createContext, useContext, useRef } from "react"
import { type StoreApi, useStore } from "zustand"

import {
  type HistoryStore,
  createHistoryStore,
  initHistoryStore,
} from "@src/stores/historyStore"

export const HistoryStoreContext = createContext<StoreApi<HistoryStore> | null>(
  null
)

export interface HistoryStoreProviderProps {
  children: ReactNode
}

export const HistoryStoreProvider = ({
  children,
}: HistoryStoreProviderProps) => {
  const storeRef = useRef<StoreApi<HistoryStore> | null>(null)
  if (!storeRef.current) {
    storeRef.current = createHistoryStore(initHistoryStore())
  }

  return (
    <HistoryStoreContext.Provider value={storeRef.current}>
      {children}
    </HistoryStoreContext.Provider>
  )
}

export const useHistoryStore = <T,>(
  selector: (store: HistoryStore) => T
): T => {
  const historyStoreContext = useContext(HistoryStoreContext)

  if (!historyStoreContext) {
    throw new Error("useHistoryStore must be use within HistoryStoreProvider")
  }

  return useStore(historyStoreContext, selector)
}

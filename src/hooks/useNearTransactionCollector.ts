"use client"
import { useEffect, useState } from "react"

import { useQueryCollector } from "@src/hooks/useQuery"

export interface EventJson {
  standard: string
  version: string
  event: string
  data: {
    [key: string]: string | string[]
  }
}

export interface CollectorHook {
  getTransactions: () => Promise<EventJson[]>
}

// This hook uses modules for gathering historical transactions, filtering, and
// transferring to history module
export const useNearTransactionCollector = (
  collectorHooks: CollectorHook[]
) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)
  const [transitStore, setTransitStore] = useState<EventJson[]>([])

  const runTransactionCollector = async () => {
    try {
      setIsFetching(true)
      const allTransactions = await Promise.all(
        collectorHooks.map((hook) => hook.getTransactions())
      )

      // Flatten the array of arrays into a single array
      const mergedTransactions = allTransactions.flat()

      setTransitStore(mergedTransactions)
      setIsFetching(false)
    } catch (e) {
      console.log("runTransactionCollector: ", e)
      setIsError(true)
      setIsFetching(false)
    }
  }

  return {
    runTransactionCollector,
    transitStore,
    isFetching,
    isError,
  }
}

export const useCombinedTransactionCollector = () => {
  const queryCollector = useQueryCollector()
  return useNearTransactionCollector([queryCollector])
}

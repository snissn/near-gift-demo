"use client"

import { useCallback } from "react"
import { useSearchParams } from "next/navigation"

import {
  CollectorHook,
  EventJson,
} from "@src/hooks/useNearTransactionCollector"

export const useCreateQueryString = () => {
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  return {
    createQueryString,
  }
}

// This hook collects transactions based on query parameters from the URL
export const useQueryCollector = (): CollectorHook => {
  const searchParams = useSearchParams()

  const getTransactions = useCallback(async (): Promise<EventJson[]> => {
    const errorMessage = searchParams.get("errorMessage")
    const transactionHashes = searchParams.get("transactionHashes")
    const errorCode = searchParams.get("errorCode")
    console.log(errorMessage, "errorMessage")
    console.log(transactionHashes, "transactionHashes")
    console.log(errorCode, "errorCode")

    // TODO Fetch details from transactionHashes
    //      and format to history widget
    return []
  }, [searchParams])

  return {
    getTransactions,
  }
}

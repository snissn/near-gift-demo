"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import {
  getNearBlockById,
  getNearTransactionDetails,
} from "@src/api/transaction"
import type { ModalConfirmSwapPayload } from "@src/components/Modal/ModalConfirmSwap"
import { CONFIRM_SWAP_LOCAL_KEY } from "@src/constants/contracts"
import type { CollectorHook } from "@src/hooks/useHistoryCollector"
import { useHistoryStore } from "@src/providers/HistoryStoreProvider"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import type { HistoryData } from "@src/stores/historyStore"
import type {
  NearBlock,
  NearTX,
  NetworkToken,
  Result,
} from "@src/types/interfaces"

interface HistoryFromLocal {
  tokenIn?: string
  tokenOut?: string
  selectedTokenIn?: NetworkToken
  selectedTokenOut?: NetworkToken
}

export enum UseQueryCollectorKeys {
  INTENT_ID = "intentId",
  TRANSACTION_HASHS = "transactionHashes",
  ERROR_MESSAGE = "errorMessage",
  ERROR_CODE = "errorCode",
}

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { accountId } = useWalletSelector()
  const { togglePreview } = useHistoryStore((state) => state)

  const cleanupQuery = (keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const key of keys) params.delete(key)
    router.replace(`${pathname}?${params}`)
  }

  const handleCleanupQuery = () => {
    cleanupQuery([
      UseQueryCollectorKeys.ERROR_MESSAGE,
      UseQueryCollectorKeys.ERROR_CODE,
      UseQueryCollectorKeys.TRANSACTION_HASHS,
    ])
  }

  const getTryToExtractDataFromLocal = (intentId: string): HistoryFromLocal => {
    const getConfirmSwapFromLocal = localStorage.getItem(CONFIRM_SWAP_LOCAL_KEY)
    if (!getConfirmSwapFromLocal) return {}
    const parsedData: { data: ModalConfirmSwapPayload } = JSON.parse(
      getConfirmSwapFromLocal
    )
    if (parsedData.data.intentId !== intentId) {
      return {}
    }
    return {
      tokenIn: parsedData.data.tokenIn,
      tokenOut: parsedData.data.tokenOut,
      selectedTokenIn: parsedData.data.selectedTokenIn,
      selectedTokenOut: parsedData.data.selectedTokenOut,
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <reason>
  const getTransactions = useCallback(async (): Promise<HistoryData[]> => {
    try {
      const intentId = searchParams.get(UseQueryCollectorKeys.INTENT_ID)
      const transactionHashes = searchParams.get(
        UseQueryCollectorKeys.TRANSACTION_HASHS
      )
      const errorMessage = searchParams.get(UseQueryCollectorKeys.ERROR_MESSAGE)
      const errorCode = searchParams.get(UseQueryCollectorKeys.ERROR_CODE)

      if (errorMessage || errorCode) {
        // TODO Add failure events
        handleCleanupQuery()
        return []
      }

      const transactionBatch = transactionHashes?.split(",") ?? []
      if (!transactionBatch.length) {
        console.log(
          "getTransactions has stopped due to the hash is missing, UseQueryCollectorKeys.TRANSACTION_HASHS"
        )
        return []
      }

      const txDatas = await Promise.all(
        transactionBatch.map(async (hash) => {
          const txData = (await getNearTransactionDetails(
            hash as string,
            accountId as string
          )) as Result<NearTX>
          if (txData?.error?.data) {
            console.log(
              "getTransactions: ",
              txData?.error?.data,
              ", hash:",
              hash
            )
          }
          let blockData = 0
          if (txData?.result?.receipts_outcome?.length) {
            const { result: resultBlock } = (await getNearBlockById(
              txData.result.receipts_outcome[0].block_hash
            )) as NearBlock
            blockData = resultBlock.header.timestamp
            return {
              hash,
              blockData,
              ...txData,
            }
          }
          return null
        })
      )

      if (txDatas.length) {
        const result: HistoryData[] = []
        txDatas.forEach((txData, i) => {
          if (i === txDatas.length - 1) {
            assert(txData, "txData is not defined")
            togglePreview(txData.hash)
          }
          if (txData) {
            result.push({
              intentId: intentId as string,
              hash: txData.hash as string,
              timestamp: txData.blockData ?? 0,
              details: {
                receipts_outcome: txData.result?.receipts_outcome,
                transaction: txData.result?.transaction,
                ...getTryToExtractDataFromLocal(intentId as string),
              },
            })
          }
        })
        handleCleanupQuery()
        return result
      }

      handleCleanupQuery()
      return []
    } catch (e) {
      console.log("useQueryCollector: ", e)
      return []
    }
  }, [searchParams])

  return {
    getTransactions,
  }
}

function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) {
    throw new Error(msg)
  }
}

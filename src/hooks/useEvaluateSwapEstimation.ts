"use client"

import { useState } from "react"

import { DataEstimateRequest } from "@src/libs/de-sdk/types/interfaces"
import { SwapEstimateBotResult } from "@src/hooks/useSwapEstimateBot"
import { swapEstimateRefFinanceProvider } from "@src/libs/de-sdk/providers/refFinanceProvider"

const IS_DISABLE_QUOTING_FROM_REF =
  process.env.NEXT_PUBLIC_DISABLE_QUOTING_FROM_REF === "true"
const IS_DISABLE_QUOTING_FROM_COINGECKO =
  process.env.NEXT_PUBLIC_DISABLE_QUOTING_FROM_COINGECKO === "true"

export enum EvaluateResultEnum {
  BEST = "best price",
  LOW = "low price",
}

export interface EvaluateSwapEstimationResult {
  priceEvaluation: EvaluateResultEnum | undefined
  priceResults?: {
    solver_id: string
    amount_out: string
  }[]
}

const ESTIMATE_DIFFERENCE_PERCENTAGE = 2

export const useEvaluateSwapEstimation = () => {
  const [data, setData] = useState<EvaluateSwapEstimationResult | undefined>()

  const getSwapEstimateFromRefFinance = async (
    dataEstimate: DataEstimateRequest,
    bestOut: SwapEstimateBotResult["bestOut"]
  ): Promise<void> => {
    if (!IS_DISABLE_QUOTING_FROM_REF) {
      const result = await swapEstimateRefFinanceProvider(dataEstimate)
      if (parseFloat(result.amount_out) && bestOut) {
        if (bestOut > result.amount_out) {
          setData((state) => ({
            priceEvaluation: EvaluateResultEnum.BEST,
            priceResults: state?.priceResults,
          }))
          return
        }
        const resultAmountOut = parseFloat(result.amount_out)
        const difference = Math.abs(Number(bestOut) - resultAmountOut)
        const average = (Number(bestOut) + resultAmountOut) / 2
        const percentageDifference = (difference / average) * 100

        if (percentageDifference > ESTIMATE_DIFFERENCE_PERCENTAGE) {
          setData((state) => ({
            priceEvaluation: EvaluateResultEnum.LOW,
            priceResults: state?.priceResults,
          }))
          return
        }
      }
      return
    }

    setData((state) => ({
      priceEvaluation: EvaluateResultEnum.BEST,
      priceResults: state?.priceResults,
    }))
  }

  const getSolversResults = (
    estimatesFromSolvers: SwapEstimateBotResult["allEstimates"]
  ) => {
    setData((state) => ({
      priceEvaluation: state?.priceEvaluation,
      priceResults: estimatesFromSolvers,
    }))
  }

  const getEvaluateSwapEstimate = async (
    data: DataEstimateRequest,
    estimatesFromSolvers: SwapEstimateBotResult["allEstimates"],
    bestOut: SwapEstimateBotResult["bestOut"]
  ): Promise<void> => {
    setData({
      priceEvaluation: undefined,
      priceResults: undefined,
    })
    getSolversResults(estimatesFromSolvers)

    await getSwapEstimateFromRefFinance(data, bestOut)
  }

  return {
    data,
    getEvaluateSwapEstimate,
  }
}

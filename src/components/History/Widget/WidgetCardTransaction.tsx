"use client"

import React, { useState } from "react"

import { HistoryData, HistoryStatus } from "@src/stores/historyStore"
import {
  NearTX,
  NetworkTokenWithSwapRoute,
  QueueTransactions,
} from "@src/types/interfaces"
import { useHistoryStore } from "@src/providers/HistoryStoreProvider"
import { useNetworkTokens } from "@src/hooks/useNetworkTokens"
import { useSwap } from "@src/hooks/useSwap"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import WidgetCardSwap from "@src/components/History/Widget/WidgetCardSwap"
import WidgetCardLoading from "@src/components/History/Widget/WidgetCardLoading"
import WidgetCardRollback from "@src/components/History/Widget/WidgetCardRollback"

type Props = {
  onCloseHistory?: () => void
  withCloseHistory?: boolean
}

const WidgetCardTransaction = ({
  clientId,
  hash,
  details,
  timestamp,
  status,
}: HistoryData & Props) => {
  const { selector, accountId } = useWalletSelector()
  const { callRequestRollbackIntent } = useSwap({ selector, accountId })

  const iTokenDetailMissing =
    !details?.tokenIn ||
    !details.tokenOut ||
    !details.selectedTokenIn ||
    !details.selectedTokenOut

  const handleGetTypeOfQueueTransactions = (
    transaction: NearTX["transaction"]
  ): QueueTransactions | undefined => {
    if (
      transaction.actions[0].FunctionCall.method_name === "ft_transfer_call" ||
      transaction.actions[0].FunctionCall.method_name === "rollback_intent"
    ) {
      return QueueTransactions.CREATE_INTENT
    }
    if (transaction.actions[0].FunctionCall.method_name === "storage_deposit") {
      // No matter is IN or OUT as QueueTransactions.STORAGE_DEPOSIT_TOKEN_OUT
      return QueueTransactions.STORAGE_DEPOSIT_TOKEN_IN
    }
    if (transaction.actions[0].FunctionCall.method_name === "near_deposit") {
      return QueueTransactions.DEPOSIT
    }
    if (transaction.actions[0].FunctionCall.method_name === "near_withdraw") {
      return QueueTransactions.WITHDRAW
    }
  }

  switch (
    handleGetTypeOfQueueTransactions(
      details!.transaction as NearTX["transaction"]
    )
  ) {
    case QueueTransactions.CREATE_INTENT:
      switch (status) {
        case HistoryStatus.FAILED:
          return <WidgetCardLoading />

        case HistoryStatus.AVAILABLE:
        case HistoryStatus.COMPLETED:
          if (iTokenDetailMissing) {
            return <WidgetCardLoading />
          }
          return (
            <WidgetCardSwap
              hash={hash}
              status={status}
              clientId={clientId}
              tokenIn={details!.tokenIn as string}
              tokenOut={details!.tokenOut as string}
              selectedTokenIn={
                details!.selectedTokenIn as NetworkTokenWithSwapRoute
              }
              selectedTokenOut={
                details!.selectedTokenOut as NetworkTokenWithSwapRoute
              }
              timestamp={timestamp}
              handleCloseIntent={callRequestRollbackIntent}
            />
          )

        case HistoryStatus.ROLLED_BACK:
          if (!details?.transaction?.actions || !hash || iTokenDetailMissing) {
            return <WidgetCardLoading />
          }
          return (
            <WidgetCardRollback
              actions={details!.transaction!.actions}
              tokenIn={details!.tokenIn as string}
              tokenOut={details!.tokenOut as string}
              selectedTokenIn={
                details!.selectedTokenIn as NetworkTokenWithSwapRoute
              }
              selectedTokenOut={
                details!.selectedTokenOut as NetworkTokenWithSwapRoute
              }
              hash={hash}
            />
          )
      }
  }

  return <WidgetCardLoading />
}

export default WidgetCardTransaction

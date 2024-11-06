"use client"

import React from "react"

import { DepositWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet"
import { useNotificationStore } from "@src/providers/NotificationProvider"
import { NotificationType } from "@src/stores/notificationStore"

export default function Deposit() {
  const { state, sendTransaction } = useConnectWallet()
  const setNotification = useNotificationStore((state) => state.setNotification)

  return (
    <Paper title="Deposit">
      <DepositWidget
        tokenList={LIST_TOKENS}
        userAddress={state.address}
        // @ts-expect-error
        chainType={state.chainType}
        sendTransactionNear={async (transactions) => {
          const result = await sendTransaction({
            id: ChainType.Near,
            transactions,
          })

          // For batch transactions, the result is an array with the transaction hash as the second element
          return Array.isArray(result) ? result[1].transaction.hash : result
        }}
        onEmit={(event) => {
          if (event.type === "SUCCESSFUL_DEPOSIT") {
            setNotification({
              id: crypto.randomUUID(),
              message: "Deposit successful",
              type: NotificationType.SUCCESS,
            })
          }
          if (event.type === "FAILED_DEPOSIT") {
            setNotification({
              id: crypto.randomUUID(),
              message: "Deposit failed",
              type: NotificationType.ERROR,
            })
          }
        }}
      />
    </Paper>
  )
}

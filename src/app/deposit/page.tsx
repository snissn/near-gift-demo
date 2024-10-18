"use client"

import React from "react"

import { DepositWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { useNearWalletActions } from "@src/hooks/useNearWalletActions"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"

export default function Deposit() {
  const { signAndSendTransactions } = useNearWalletActions()
  const { accountId, selector } = useWalletSelector()
  return (
    <Paper title="Deposit">
      <DepositWidget
        accountId={accountId || ""}
        signAndSendTransactionsNear={async (transactions) => {
          assert(selector, "Wallet selector is not found")
          const transactionResult = await signAndSendTransactions({
            transactions,
          })
          // TODO: handle transaction result
          console.log("transactionResult", transactionResult)
          return ""
        }}
      />
    </Paper>
  )
}

function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg)
  }
}

"use client"

import type { Transaction } from "@near-wallet-selector/core"
import React from "react"

import { DepositWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"

export default function Deposit() {
  const { accountId, selector } = useWalletSelector()
  return (
    <Paper title="Deposit">
      <DepositWidget
        accountId={accountId || ""}
        signAndSendTransactionsNear={async (transactions) => {
          assert(selector, "Wallet selector is not found")
          const wallet = await selector.wallet()
          const transactionResult = await wallet.signAndSendTransactions({
            transactions,
          })
          return transactionResult && transactionResult.length > 0
            ? transactionResult[0]
            : ""
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

"use client"

import React from "react"

import { DepositWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import {
  SendTransactionType,
  SignInType,
  useConnectWallet,
} from "@src/hooks/useConnectWallet"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"

export default function Deposit() {
  const { state, sendTransaction } = useConnectWallet()
  const { selector } = useWalletSelector()
  return (
    <Paper title="Deposit">
      <DepositWidget
        accountId={state.address || ""}
        signAndSendTransactionsNear={async (transactions) => {
          assert(selector, "Wallet selector is not found")
          const transactionResult = await sendTransaction({
            id: SignInType.NearWalletSelector,
            type: SendTransactionType.SignAndSendTransactions,
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

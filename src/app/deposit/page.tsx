"use client"

import React from "react"

import { DepositWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { SignInType, useConnectWallet } from "@src/hooks/useConnectWallet"

export default function Deposit() {
  const { state, sendTransaction } = useConnectWallet()

  return (
    <Paper title="Deposit">
      <DepositWidget
        tokenList={LIST_TOKENS}
        accountId={state.address}
        sendTransactionNear={async (transactions) => {
          const result = await sendTransaction({
            id: SignInType.NearWalletSelector,
            transactions,
          })

          // For batch transactions, the result is an array with the transaction hash as the second element
          return Array.isArray(result) ? result[1].transaction.hash : result
        }}
      />
    </Paper>
  )
}

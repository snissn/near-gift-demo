"use client"

import React from "react"

import { WithdrawWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet } from "@src/hooks/useConnectWallet"

type FormValues = {
  tokenIn: string
  walletTo: string
}

export default function Withdraw() {
  const { state, sendTransaction } = useConnectWallet()
  return (
    <Paper title="Withdraw">
      <WithdrawWidget
        tokenList={LIST_TOKENS}
        accountId={state.address || ""}
        // @ts-expect-error this is mock function
        signMessage={async (params: unknown) => {
          console.log("params", params)

          return { type: "NEP413", signatureData: "", signedData: "" }
        }}
      />
    </Paper>
  )
}

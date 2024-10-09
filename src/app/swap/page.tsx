"use client"

import { SwapWidget } from "@defuse-protocol/defuse-sdk"
import React from "react"

import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"

type SwapMessageParams = {
  message: string
  recipient: string
  nonce: Buffer
  callbackUrl?: string
  state?: string
}

export default function Swap() {
  const { accountId, selector } = useWalletSelector()

  const handleSign = async (params: SwapMessageParams) => {
    if (!accountId || !selector) {
      return { signature: "" }
    }
    const wallet = await selector?.wallet()
    const result = await wallet?.signMessage({
      message: params.message,
      recipient: params.recipient,
      nonce: params.nonce,
    })
    return { signature: result?.signature || "" }
  }

  return (
    <Paper
      title="Swap"
      description="Cross-chain swap across any network, any token."
    >
      <SwapWidget tokenList={LIST_TOKENS} onSign={handleSign} />
    </Paper>
  )
}

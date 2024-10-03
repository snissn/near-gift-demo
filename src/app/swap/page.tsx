"use client"

import React from "react"
import { SwapWidget } from "@defuse-protocol/defuse-sdk"

import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"

export default function Swap() {
  return (
    <Paper
      title="Swap"
      description="Cross-chain swap across any network, any token."
    >
      <SwapWidget
        tokenList={LIST_TOKENS}
        onSign={() => Promise.resolve({ signature: "" })}
      />
    </Paper>
  )
}

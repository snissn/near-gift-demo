"use client"

import React from "react"

import Paper from "@src/components/Paper"
import SwapForm from "@src/app/swap/SwapForm"

export default function Swap() {
  return (
    <Paper
      title="Swap"
      description="Cross-chain swap across any network, any token."
    >
      <SwapForm />
    </Paper>
  )
}

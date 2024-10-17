"use client"

import { SwapWidget } from "@defuse-protocol/defuse-sdk"

import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useNearWalletActions } from "@src/hooks/useNearWalletActions"

export default function Swap() {
  const { signMessage } = useNearWalletActions()

  return (
    <Paper
      title="Swap"
      description="Cross-chain swap across any network, any token."
    >
      <SwapWidget
        tokenList={LIST_TOKENS}
        signMessage={async (params) => {
          const sig = await signMessage({
            ...params.NEP141,
            nonce: Buffer.from(params.NEP141.nonce),
          })

          if (!sig) {
            throw new Error("No signature")
          }

          return { type: "NEP141", signatureData: sig }
        }}
      />
    </Paper>
  )
}

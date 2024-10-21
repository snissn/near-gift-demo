"use client"

import { SwapWidget } from "@defuse-protocol/defuse-sdk"
import { formatUnits } from "viem"

import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useNearWalletActions } from "@src/hooks/useNearWalletActions"
import { useNotificationStore } from "@src/providers/NotificationProvider"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { NotificationType } from "@src/stores/notificationStore"

export default function Swap() {
  const { accountId } = useWalletSelector()
  const { signMessage } = useNearWalletActions()
  const setNotification = useNotificationStore((state) => state.setNotification)

  return (
    <Paper
      title="Swap"
      description="Cross-chain swap across any network, any token."
    >
      <SwapWidget
        tokenList={LIST_TOKENS}
        userAddress={accountId}
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
        onSuccessSwap={({ amountOut, tokenOut }) => {
          setNotification({
            id: crypto.randomUUID(),
            message: `Transaction complete! You received ${formatUnits(amountOut, tokenOut.decimals)} ${tokenOut.symbol}`,
            type: NotificationType.SUCCESS,
          })
        }}
      />
    </Paper>
  )
}

"use client"

import { WithdrawWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useNearWalletActions } from "@src/hooks/useNearWalletActions"

export default function Withdraw() {
  const { state } = useConnectWallet()
  const { signMessage, signAndSendTransactions } = useNearWalletActions()

  return (
    <Paper title="Withdraw">
      <WithdrawWidget
        tokenList={LIST_TOKENS}
        // @ts-ignore
        accountId={state.address}
        // @ts-ignore
        sendNearTransaction={async (tx) => {
          const result = await signAndSendTransactions({ transactions: [tx] })

          if (typeof result === "string") {
            return { txHash: result }
          }

          const outcome = result[0]
          if (!outcome) {
            throw new Error("No outcome")
          }

          return { txHash: outcome.transaction.hash }
        }}
        signMessage={async (params) => {
          const { signatureData, signedData } = await signMessage({
            ...params.NEP413,
            nonce: Buffer.from(params.NEP413.nonce),
          })

          return { type: "NEP413", signatureData, signedData }
        }}
      />
    </Paper>
  )
}

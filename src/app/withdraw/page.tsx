"use client"

import { useSignMessage } from "wagmi"

import { WithdrawWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { SignInType, useConnectWallet } from "@src/hooks/useConnectWallet"
import { useNearWalletActions } from "@src/hooks/useNearWalletActions"

export default function Withdraw() {
  const { state } = useConnectWallet()
  const { signMessage, signAndSendTransactions } = useNearWalletActions()
  const { signMessageAsync: signMessageAsyncWagmi } = useSignMessage()

  return (
    <Paper title="Withdraw">
      <WithdrawWidget
        tokenList={LIST_TOKENS}
        userAddress={state.address}
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
          const signInType = state.signInType

          switch (signInType) {
            case SignInType.Wagmi: {
              const signatureData = await signMessageAsyncWagmi({
                message: params.ERC191.message,
              })
              return {
                type: "ERC191",
                signatureData,
                signedData: params.ERC191,
              }
            }
            case SignInType.NearWalletSelector: {
              const { signatureData, signedData } = await signMessage({
                ...params.NEP413,
                nonce: Buffer.from(params.NEP413.nonce),
              })
              return { type: "NEP413", signatureData, signedData }
            }
            case undefined:
              throw new Error("User not signed in")
            default:
              signInType satisfies never
              throw new Error(`Unsupported sign in type: ${signInType}`)
          }
        }}
      />
    </Paper>
  )
}

"use client"
import { WithdrawWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useIntentsReferral } from "@src/hooks/useIntentsReferral"
import { useTokenList } from "@src/hooks/useTokenList"
import { useWalletAgnosticSignMessage } from "@src/hooks/useWalletAgnosticSignMessage"
import { useNearWallet } from "@src/providers/NearWalletProvider"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function WithdrawContent() {
  const { state } = useConnectWallet()
  const signMessage = useWalletAgnosticSignMessage()
  const { signAndSendTransactions } = useNearWallet()
  const tokenList = useTokenList(LIST_TOKENS)
  const referral = useIntentsReferral()
  const queryParams = useSearchParams()
  const amount = queryParams.get("amount") ?? undefined
  const tokenSymbol = queryParams.get("token") ?? undefined
  const network = queryParams.get("network") ?? undefined
  const recipient = queryParams.get("recipient") ?? undefined

  const userAddress = state.isVerified ? state.address : undefined
  const userChainType =
    state.chainType === undefined
      ? undefined
      : state.chainType === "near"
        ? "near"
        : state.chainType === "evm"
          ? "evm"
          : state.chainType === "solana"
            ? "solana"
            : undefined

  return (
    <Paper>
      <WithdrawWidget
        presetAmount={amount}
        presetNetwork={network}
        presetRecipient={recipient}
        presetTokenSymbol={tokenSymbol}
        tokenList={tokenList}
        userAddress={userAddress}
        chainType={userChainType}
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
          const rUnknown = await signMessage(
            params as unknown as {
              ERC191: { message: string }
              NEP413: {
                message: string
                recipient: string
                nonce: Uint8Array
                callbackUrl?: string
              }
              SOLANA: { message: Uint8Array }
            }
          )

          if (
            rUnknown &&
            typeof rUnknown === "object" &&
            "type" in rUnknown &&
            ["NEP413", "ERC191", "SOLANA"].includes(
              (rUnknown as { type: string }).type
            )
          ) {
            return rUnknown as {
              type: "NEP413" | "ERC191" | "SOLANA"
              signatureData: unknown
              signedData: unknown
            }
          }
          return null
        }}
        referral={referral}
      />
    </Paper>
  )
}
export default function Withdraw() {
  return (
    <Suspense fallback={null}>
      <WithdrawContent />
    </Suspense>
  )
}

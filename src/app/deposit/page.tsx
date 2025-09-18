"use client"
import { Suspense } from "react"

import { DepositWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet"
import { useTokenList } from "@src/hooks/useTokenList"
import { useRouter, useSearchParams } from "next/navigation"

function DepositContent() {
  const { state, sendTransaction } = useConnectWallet()
  const tokenList = useTokenList(LIST_TOKENS)
  const _router = useRouter()
  const _searchParams = useSearchParams()
  const sdkChainType =
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
      <DepositWidget
        tokenList={tokenList}
        userAddress={state.isVerified ? state.address : undefined}
        chainType={sdkChainType}
        sendTransactionNear={async (tx) => {
          const result = await sendTransaction({
            id: ChainType.Near,
            tx,
          })
          return Array.isArray(result) ? result[0].transaction.hash : result
        }}
        sendTransactionEVM={async () => Promise.reject("Unsupported chain")}
        sendTransactionSolana={async () => Promise.reject("Unsupported chain")}
        // initialToken omitted; simplified URL handling for learning edition
      />
    </Paper>
  )
}
export default function Deposit() {
  return (
    <Suspense fallback={null}>
      <DepositContent />
    </Suspense>
  )
}

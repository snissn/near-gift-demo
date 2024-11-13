"use client"

import React from "react"

import { DepositWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet"
import { useAccount } from "wagmi"
import type { Chain } from "wagmi/chains"

export default function Deposit() {
  const { state, sendTransaction } = useConnectWallet()
  const { chain } = useAccount()

  return (
    <Paper title="Deposit">
      <DepositWidget
        tokenList={LIST_TOKENS}
        userAddress={state.address}
        chainType={state.chainType}
        rpcUrl={getRPCUrl(chain)}
        sendTransactionNear={async (transactions) => {
          const result = await sendTransaction({
            id: ChainType.Near,
            transactions,
          })
          // For batch transactions, the result is an array with the transaction hash as the second element
          return Array.isArray(result) ? result[1].transaction.hash : result
        }}
        sendTransactionEVM={async (calldata) => {
          const result = await sendTransaction({
            id: ChainType.EVM,
            calldata,
          })
          return Array.isArray(result) ? result[1].transaction.hash : result
        }}
      />
    </Paper>
  )
}

function getRPCUrl(chain: Chain | undefined) {
  return chain ? chain.rpcUrls.default?.http[0] : undefined
}

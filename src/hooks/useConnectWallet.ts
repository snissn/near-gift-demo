"use client"

import type { FinalExecutionOutcome } from "@near-wallet-selector/core"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import type { SignAndSendTransactionsParams } from "@src/types/interfaces"
import { useEffect, useState } from "react"
import { type Connector, useAccount, useConnect, useDisconnect } from "wagmi"
import { useNearWalletActions } from "./useNearWalletActions"

export enum ChainType {
  Near = "near",
  EMV = "evm",
}

export enum SendTransactionType {
  SignAndSendTransactions = "signAndSendTransactions",
}

type State = {
  chainType?: ChainType
  network?: string
  address?: string
}

interface ConnectWalletAction {
  signIn: (params: {
    id: ChainType
    connector?: Connector
  }) => Promise<void>
  signOut: (params: { id: ChainType }) => Promise<void>
  signMessage: (params: { id: ChainType; message: string }) => Promise<void>
  sendTransaction: (params: {
    id: ChainType
    transactions: SignAndSendTransactionsParams["transactions"]
  }) => Promise<string | FinalExecutionOutcome[]>
  connectors: Connector[]
  state: State
}

const defaultState: State = {
  chainType: undefined,
  network: undefined,
  address: undefined,
}

export const useConnectWallet = (): ConnectWalletAction => {
  const [state, setState] = useState<State>(defaultState)
  const { selector, modal, accountId } = useWalletSelector()
  const { signAndSendTransactions } = useNearWalletActions()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, chain } = useAccount()

  const handleSignInViaNearWalletSelector = async (): Promise<void> => {
    modal.show()
  }

  const handleSignOutViaNearWalletSelector = async () => {
    try {
      const wallet = await selector.wallet()
      await wallet.signOut()
    } catch (e) {
      console.log("Failed to sign out", e)
    }
  }

  const handleSignInViaWalletConnect = async ({
    connector,
  }: {
    connector: Connector
  }): Promise<void> => {
    if (!connector) {
      throw new Error("Invalid connector")
    }
    connect({ connector })
  }

  const handleSignOutViaWalletConnect = async () => {
    await disconnect()
  }

  useEffect(() => {
    if (accountId != null) {
      setState({
        address: accountId,
        network: "near:mainnet",
        chainType: ChainType.Near,
      })
    } else if (address != null) {
      setState({
        address,
        network: chain?.id ? `eth:${chain.name.toLowerCase()}` : "unknown",
        chainType: ChainType.EMV,
      })
    } else {
      setState(defaultState)
    }
  }, [accountId, address, chain])

  return {
    async signIn(params: {
      id: ChainType
      connector?: Connector
    }): Promise<void> {
      const strategies = {
        [ChainType.Near]: () => handleSignInViaNearWalletSelector(),
        [ChainType.EMV]: () =>
          params.connector
            ? handleSignInViaWalletConnect({ connector: params.connector })
            : undefined,
      }
      return strategies[params.id]()
    },

    async signOut(params: {
      id: ChainType
    }): Promise<void> {
      const strategies = {
        [ChainType.Near]: () => handleSignOutViaNearWalletSelector(),
        [ChainType.EMV]: () => handleSignOutViaWalletConnect(),
      }
      return strategies[params.id]()
    },

    // TODO: Implement this
    signMessage: async ({
      id,
      message,
    }: { id: ChainType; message: string }) => {},

    sendTransaction: async (
      params
    ): Promise<string | FinalExecutionOutcome[]> => {
      const strategies = {
        [ChainType.Near]: async () =>
          await signAndSendTransactions({
            transactions: params.transactions,
          }),
        [ChainType.EMV]: async () => {
          throw new Error("Wagmi sendTransaction not implemented")
        },
      }

      const result = await strategies[params.id]()
      if (result === undefined) {
        throw new Error(`Transaction failed for ${params.id}`)
      }
      return result
    },

    connectors: connectors as Connector[],
    state,
  }
}

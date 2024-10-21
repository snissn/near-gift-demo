"use client"

import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import type { SignAndSendTransactionsParams } from "@src/utils/myNearWalletAdapter"
import { useEffect, useState } from "react"
import { type Connector, useAccount, useConnect, useDisconnect } from "wagmi"
import { useNearWalletActions } from "./useNearWalletActions"

export enum SignInType {
  NearWalletSelector = "near-wallet-selector",
  WalletConnect = "wallet-connect",
  Bitcoin = "bitcoin",
}

interface ConnectWalletAction {
  signIn: ({
    id,
    params,
  }: {
    id: SignInType
    params: { connector: Connector } | undefined
  }) => Promise<void>
  signOut: ({ id }: { id: SignInType }) => Promise<void>
  signMessage: ({
    id,
    message,
  }: { id: SignInType; message: string }) => Promise<void>
  sendTransaction: ({
    id,
    type,
    transactions,
  }: {
    id: SignInType
    type: SendTransactionType
    transactions: SignAndSendTransactionsParams
  }) => Promise<void>
  connectors: Connector[]
  state: {
    keyStore: string | undefined
    network: string | undefined
    address: string | undefined
  }
}

export enum SendTransactionType {
  SignAndSendTransactions = "signAndSendTransactions",
}

export const useConnectWallet = (): ConnectWalletAction => {
  const [state, setState] = useState<{
    keyStore: string | undefined
    network: string | undefined
    address: string | undefined
  }>({
    keyStore: undefined,
    network: undefined,
    address: undefined,
  })
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

  const handleSignInViaWalletConnect = async (params?: {
    connector: Connector
  }): Promise<void> => {
    if (!params?.connector) {
      throw new Error("Invalid connector")
    }
    connect({ connector: params.connector })
  }

  const handleSignOutViaWalletConnect = async () => {
    await disconnect()
  }

  const abstractExecutor =
    (
      executors: Record<
        string,
        {
          executor: (
            params: { connector: Connector } | undefined
          ) => Promise<void>
          params?: { connector: Connector } | undefined
        }
      >
    ) =>
    (id: string) => {
      switch (id) {
        case SignInType.NearWalletSelector:
          return executors[id].executor(undefined)
        case SignInType.WalletConnect:
          return executors[id].executor(executors[id].params)
        default:
          throw new Error("Invalid executor")
      }
    }

  useEffect(() => {
    if (!accountId && !address) {
      setState({
        address: undefined,
        network: undefined,
        keyStore: undefined,
      })
    }
    if (accountId) {
      setState({
        address: accountId,
        network: "near:mainet",
        keyStore: SignInType.NearWalletSelector,
      })
    }
    if (address) {
      setState({
        address,
        network: chain?.id?.toString() ?? "unknown",
        keyStore: SignInType.WalletConnect,
      })
    }
  }, [accountId, address, chain])

  return {
    async signIn({
      id,
      params,
    }: {
      id: SignInType
      params: { connector: Connector } | undefined
    }): Promise<void> {
      await abstractExecutor({
        [SignInType.NearWalletSelector]: {
          executor: handleSignInViaNearWalletSelector,
          params: undefined,
        },
        [SignInType.WalletConnect]: {
          executor: handleSignInViaWalletConnect,
          params,
        },
      })(id)
    },

    async signOut({ id }: { id: SignInType }): Promise<void> {
      await abstractExecutor({
        [SignInType.NearWalletSelector]: {
          executor: handleSignOutViaNearWalletSelector,
          params: undefined,
        },
        [SignInType.WalletConnect]: {
          executor: handleSignOutViaWalletConnect,
          params: undefined,
        },
      })(id)
    },

    // TODO: Implement this
    signMessage: async ({
      id,
      message,
    }: { id: SignInType; message: string }) => {},

    sendTransaction: async ({
      id,
      type,
      transactions,
    }: {
      id: SignInType
      type: SendTransactionType
      transactions: SignAndSendTransactionsParams
    }) => {
      await abstractExecutor({
        [SignInType.NearWalletSelector]: {
          executor: async () => {
            if (type === SendTransactionType.SignAndSendTransactions) {
              await signAndSendTransactions({ transactions })
            }
          },
          params: undefined,
        },
      })(id)
    },

    connectors: connectors as Connector[],
    state,
  }
}

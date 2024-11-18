"use client"

import type { FinalExecutionOutcome } from "@near-wallet-selector/core"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import type {
  SendTransactionEVMParams,
  SignAndSendTransactionsParams,
} from "@src/types/interfaces"
import type { SendTransactionParameters } from "@wagmi/core"
import { useEffect, useState } from "react"
import { type Connector, useAccount, useConnect, useDisconnect } from "wagmi"
import { useEVMWalletActions } from "./useEVMWalletActions"
import { useNearWalletActions } from "./useNearWalletActions"

export enum ChainType {
  Near = "near",
  EVM = "evm",
  Solana = "sol",
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
    tx?:
      | SignAndSendTransactionsParams["transactions"]
      | SendTransactionEVMParams["transactions"]
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

  /**
   * NEAR:
   * Down below are Near Wallet handlers and actions
   */
  const {
    selector,
    modal,
    accountId: nearWalletAccountId,
  } = useWalletSelector()
  const { signAndSendTransactions } = useNearWalletActions()

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

  /**
   * EVM:
   * Down below are Wagmi Wallet handlers and actions
   */
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, chain } = useAccount()
  const { sendTransactions } = useEVMWalletActions()

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

  /**
   * Solana:
   * Down below are Solana Wallet handlers and actions
   */
  const { setVisible } = useWalletModal()
  const { publicKey: solanaPublicKey, disconnect: disconnectSolana } =
    useSolanaWallet()

  const handleSignInViaSolanaSelector = async () => {
    setVisible(true)
  }

  const handleSignOutViaSolanaSelector = async () => {
    await disconnectSolana()
  }

  /**
   * Set the state based on the current wallet connection.
   * All wallets connection should be handled here.
   */
  useEffect(() => {
    if (!nearWalletAccountId && !address && !solanaPublicKey) {
      // Reset the state if all wallets are disconnected
      return setState(defaultState)
    }
    if (nearWalletAccountId != null) {
      setState({
        address: nearWalletAccountId,
        network: "near:mainnet",
        chainType: ChainType.Near,
      })
    } else if (address != null) {
      setState({
        address,
        network: chain?.id ? `eth:${chain.id}` : "unknown",
        chainType: ChainType.EVM,
      })
    } else if (solanaPublicKey != null) {
      setState({
        address: solanaPublicKey.toBase58(),
        network: "sol:mainnet",
        chainType: ChainType.Solana,
      })
    }
  }, [nearWalletAccountId, address, chain, solanaPublicKey])

  return {
    async signIn(params: {
      id: ChainType
      connector?: Connector
    }): Promise<void> {
      const strategies = {
        [ChainType.Near]: () => handleSignInViaNearWalletSelector(),
        [ChainType.EVM]: () =>
          params.connector
            ? handleSignInViaWalletConnect({ connector: params.connector })
            : undefined,
        [ChainType.Solana]: () => handleSignInViaSolanaSelector(),
      }
      return strategies[params.id]()
    },

    async signOut(params: {
      id: ChainType
    }): Promise<void> {
      const strategies = {
        [ChainType.Near]: () => handleSignOutViaNearWalletSelector(),
        [ChainType.EVM]: () => handleSignOutViaWalletConnect(),
        [ChainType.Solana]: () => handleSignOutViaSolanaSelector(),
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
            transactions:
              params.tx as SignAndSendTransactionsParams["transactions"],
          }),
        [ChainType.EVM]: async () =>
          await sendTransactions(params.tx as SendTransactionParameters),
        [ChainType.Solana]: async () => {
          throw new Error("Solana transaction not implemented")
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

import * as Sentry from "@sentry/nextjs"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { useCallback, useEffect } from "react"
import { useConnect, useConnectorClient } from "wagmi"

// We should use custom types as QueryKey from wagmi Array type unknown
type QueryKey = [string, { chainId: number; connectorUid: string }]

export const useSentrySetUser = ({ userAddress }: { userAddress?: string }) => {
  useEffect(() => {
    if (userAddress) {
      Sentry.setUser({ id: userAddress })
    }
  }, [userAddress])
}

export const useSentrySetContextWallet = ({
  userAddress,
}: { userAddress?: string }) => {
  const { selectedWalletId: nearWalletSelector } = useWalletSelector()
  const { connectors: wagmiConnectors } = useConnect()
  const wagmiConnectorClient = useConnectorClient()

  const getWagmiConnectorName = useCallback(() => {
    const queryKey = wagmiConnectorClient.queryKey as QueryKey
    if (!queryKey || !queryKey[1]) {
      return null
    }
    const connectorUid = queryKey[1].connectorUid
    const wagmiConnector = wagmiConnectors.find(
      (connector) => connector.uid === connectorUid
    )
    return wagmiConnector?.name
  }, [wagmiConnectorClient, wagmiConnectors])

  useEffect(() => {
    if (userAddress) {
      let wallet = null
      const wagmiConnectorName = getWagmiConnectorName()
      if (wagmiConnectorName) {
        wallet = wagmiConnectorName
      }
      if (nearWalletSelector) {
        wallet = nearWalletSelector
      }
      if (wallet) {
        Sentry.setContext("wallet", { wallet })
      }
    }
  }, [userAddress, nearWalletSelector, getWagmiConnectorName])
}

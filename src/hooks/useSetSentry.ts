import { setContext, setUser } from "@sentry/nextjs"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { useEffect } from "react"
import { useAccount } from "wagmi"

export const useSentrySetUser = ({ userAddress }: { userAddress?: string }) => {
  useEffect(() => {
    if (userAddress) {
      setUser({ id: userAddress })
    }
  }, [userAddress])
}

export const useSentrySetContextWallet = ({
  userAddress,
}: { userAddress?: string }) => {
  const { selectedWalletId: nearWalletSelector } = useWalletSelector()
  const { connector } = useAccount()

  useEffect(() => {
    if (userAddress) {
      let wallet = null
      if (connector) {
        wallet = connector.name
      }
      if (nearWalletSelector) {
        wallet = nearWalletSelector
      }
      if (wallet) {
        setContext("wallet", { wallet })
      }
    }
  }, [userAddress, nearWalletSelector, connector])
}

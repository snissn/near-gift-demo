import type { SignMessageMethod } from "@near-wallet-selector/core/src/lib/wallet/wallet.types"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { signMessageInNewWindow } from "@src/utils/myNearWalletAdapter"

export function useNearWalletActions() {
  const { selector } = useWalletSelector()

  return {
    signMessage: (async (params) => {
      const wallet = await selector.wallet()

      // MyNearWallet uses redirect-based signing
      if (wallet.id === "my-near-wallet") {
        return signMessageInNewWindow({
          params,
          signal: new AbortController().signal,
        })
      }

      return wallet.signMessage(params)
    }) satisfies SignMessageMethod["signMessage"],
  }
}

import { useTokensStore } from "@src/providers/TokensStoreProvider"
import type { NetworkTokenWithSwapRoute } from "@src/types/interfaces"

export const useNetworkTokens = () => {
  const { data: networkTokens } = useTokensStore((state) => state)

  const getTokensDataByIds = (
    tokenId: string[]
  ): NetworkTokenWithSwapRoute[] => {
    const result: NetworkTokenWithSwapRoute[] = []

    if (!networkTokens.size) {
      return result
    }

    for (const token of networkTokens.values()) {
      for (const id of tokenId) {
        if (token.address?.toLowerCase() === id.toLowerCase()) {
          result.push(token)
        }
      }
    }

    return result
  }

  return {
    getTokensDataByIds,
  }
}

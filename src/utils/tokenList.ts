import { NetworkTokenWithSwapRoute } from "@src/types/interfaces"

/**
 * Wrap Near has to be applied to Native Near and goes in conjunction on Swap.
 *
 * Additional Notes:
 * - Use Withdrawal of wNear if amount of Swap event less than user Native Near balance and less than user Native Near balance plus wNear balance.
 */
export const tieNativeToWrapToken = (
  tokenList: NetworkTokenWithSwapRoute[]
): NetworkTokenWithSwapRoute[] => {
  return tokenList.reduce<NetworkTokenWithSwapRoute[]>((acc, token, i, arr) => {
    if (token.defuse_asset_id === "near:mainnet:wrap.near") {
      return acc
    }
    if (token.defuse_asset_id === "near:mainnet:native") {
      const findWNear = arr.find(
        (token) => token.defuse_asset_id === "near:mainnet:wrap.near"
      )
      if (findWNear) {
        const balanceWNear = findWNear?.balance ?? 0
        const balanceWNearToUsd = findWNear?.balanceToUsd ?? 0
        const totalBalance = (token?.balance ?? 0) + balanceWNear
        const totalBalanceToUsd = (token?.balanceToUsd ?? 0) + balanceWNearToUsd
        acc.push({
          ...token,
          balance: totalBalance,
          balanceToUsd: totalBalanceToUsd,
        })
        return acc
      }
    }
    acc.push(token)
    return acc
  }, [])
}

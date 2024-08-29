import { NetworkTokenWithSwapRoute } from "@src/types/interfaces"
import { NEAR_TOKEN_META, W_NEAR_TOKEN_META } from "@src/constants/tokens"

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
    if (token.defuse_asset_id === W_NEAR_TOKEN_META.defuse_asset_id) {
      return acc
    }
    if (token.defuse_asset_id === NEAR_TOKEN_META.defuse_asset_id) {
      const findWNear = arr.find(
        (token) => token.defuse_asset_id === W_NEAR_TOKEN_META.defuse_asset_id
      )
      if (findWNear) {
        const balanceNear = token?.balance ?? 0
        const balanceNearUsd = token?.balanceUsd ?? 0
        const balanceWNear = findWNear?.balance ?? 0
        const balanceWNearUsd = findWNear?.balanceUsd ?? 0

        const totalBalance = (
          BigInt(balanceNear) + BigInt(balanceWNear)
        ).toString()
        const totalBalanceUsd = balanceNearUsd + balanceWNearUsd

        acc.push({
          ...token,
          balance: totalBalance,
          balanceUsd: totalBalanceUsd,
        })
        return acc
      }
    }
    acc.push(token)
    return acc
  }, [])
}

export const sortByTopBalances = (
  tokenA: NetworkTokenWithSwapRoute,
  tokenB: NetworkTokenWithSwapRoute
) => {
  const balanceA = BigInt(tokenA?.balance ?? "0")
  const balanceB = BigInt(tokenB?.balance ?? "0")

  if (balanceA < balanceB) {
    return 1
  }
  if (balanceA > balanceB) {
    return -1
  }
  return 0
}

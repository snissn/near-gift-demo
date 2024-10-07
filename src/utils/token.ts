import { formatUnits } from "ethers"

import type { SolverToken } from "@src/libs/de-sdk/providers/solver0Provider"
import type { NetworkTokenWithSwapRoute } from "@src/types/interfaces"
import parseDefuseAsset from "@src/utils/parseDefuseAsset"
import { getChainIconFromId } from "@src/hooks/useTokensListAdapter"

export const smallBalanceToFormat = (balance: string, toFixed = 14): string => {
  if (!Number.parseFloat(balance)) {
    return balance
  }
  const isSmallBalance = Number.parseFloat(balance) < 0.00001
  if (isSmallBalance) {
    return "~0.00001"
  }
  return Number.parseFloat(balance.substring(0, toFixed)).toString()
}

export const smallNumberToString = (balance: number): string => {
  if (Number.parseFloat(balance.toString()) < 0.00001) {
    return Number.parseFloat(balance.toString()).toFixed(8).toString()
  }
  return balance.toString()
}

export const tokenBalanceToFormatUnits = ({
  balance,
  decimals,
}: {
  balance: string | undefined
  decimals: number
}): string => {
  if (!Number.parseFloat(balance?.toString() ?? "0")) {
    return "0"
  }
  const balanceToUnits = formatUnits(
    BigInt(balance!.toString()),
    decimals
  ).toString()

  return smallBalanceToFormat(balanceToUnits, 7)
}

export const tokenMetaAdapter = (
  token: SolverToken
): NetworkTokenWithSwapRoute => {
  const result = parseDefuseAsset(token.defuse_asset_id)
  return {
    defuse_asset_id: token.defuse_asset_id,
    symbol: token.asset_name,
    name: token.asset_name,
    decimals: token.decimals,
    icon: token.metadata_link,
    address: result?.contractId ?? "",
    blockchain: result?.blockchain ?? "",
    chainId: result?.network ?? "",
    chainName: result?.blockchain ?? "",
    chainIcon: getChainIconFromId(token.defuse_asset_id),
    routes: token.routes_to,
  }
}

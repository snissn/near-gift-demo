import { BigNumber } from "ethers"
import { formatUnits } from "viem"

import { SolverToken } from "@src/libs/de-sdk/providers/solver0Provider"
import { NetworkTokenWithSwapRoute } from "@src/types/interfaces"
import parseDefuseAsset from "@src/utils/parseDefuseAsset"
import { getChainIconFromId } from "@src/hooks/useTokensListAdapter"

export const smallBalanceToFormat = (balance: string, toFixed = 14): string => {
  if (!parseFloat(balance)) {
    return balance
  }
  const isSmallBalance = parseFloat(balance) < 0.00001
  if (isSmallBalance) {
    return "~0.00001"
  }
  return parseFloat(balance.substring(0, toFixed)).toString()
}

export const smallNumberToString = (balance: number): string => {
  if (parseFloat(balance.toString()) < 0.00001) {
    return parseFloat(balance.toString()).toFixed(8).toString()
  }
  return balance.toString()
}

export const tokenBalanceToFormatUnits = ({
  balance,
  decimals,
}: {
  balance: string | BigNumber | undefined
  decimals: number
}): string => {
  const balanceToString =
    balance !== undefined ? BigNumber.from(balance || "0").toString() : "0"
  if (!parseFloat(balanceToString)) {
    return "0"
  }
  const balanceToUnits = formatUnits(
    BigInt(balanceToString),
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

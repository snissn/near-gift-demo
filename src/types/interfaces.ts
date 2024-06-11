import type { AccountView } from "near-api-js/lib/providers/provider"
import { BigNumber } from "ethers"

export type Account = AccountView & {
  account_id: string
}

export type TokenInfo = {
  address: string
  symbol: string
  name: string
  decimals: number
  icon?: string
  balance?: string | BigNumber
  balanceToUds?: string
}

export interface NetworkToken extends Partial<TokenInfo> {
  chainId?: string
  chainIcon?: string
  chainName?: string
}

import type { AccountView } from "near-api-js/lib/providers/provider"
import { BigNumber } from "ethers"

export interface Message {
  premium: boolean
  sender: string
  text: string
}

export type Account = AccountView & {
  account_id: string
}

export type TokenInfo = {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
}

export type Token = TokenInfo & {
  balance?: BigNumber
  custom?: boolean
}

import BN from "bn.js"
import { providers } from "near-api-js"
import type { AccountView } from "near-api-js/lib/providers/provider"

interface GetAccountBalanceProps {
  provider: providers.Provider
  accountId: string
}

export const useAccountBalance = () => {
  const getAccountBalance = async ({
    provider,
    accountId,
  }: GetAccountBalanceProps) => {
    try {
      const { amount } = await provider.query<AccountView>({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      })
      const bn = new BN(amount)
      return { hasBalance: !bn.isZero() }
    } catch {
      return { hasBalance: false }
    }
  }

  return {
    getAccountBalance,
  }
}

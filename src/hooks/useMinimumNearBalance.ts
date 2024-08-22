import { useEffect, useState } from "react"

import { useGetViewAccount } from "@src/api/hooks/account/useGetViewAccount"
import { minimumNearBalance } from "@src/components/SwapForm/service/getBalanceNearAllowedToSwap"

export const useMinimumNearBalance = (accountId: string | null) => {
  const [minNearBalance, setMinNearBalance] = useState(0)
  const { data, isFetched } = useGetViewAccount(accountId)

  useEffect(() => {
    if (isFetched && data?.result?.storage_usage) {
      setMinNearBalance(minimumNearBalance(data.result.storage_usage))
    }
  }, [data, isFetched])

  return {
    minNearBalance,
  }
}

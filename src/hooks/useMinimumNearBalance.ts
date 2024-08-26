import { useEffect, useState } from "react"
import { BigNumber } from "ethers"

import { useGetViewAccount } from "@src/api/hooks/account/useGetViewAccount"
import { minimumNearBalance } from "@src/components/SwapForm/service/getBalanceNearAllowedToSwap"

export const useMinimumNearBalance = (accountId: string | null) => {
  const [minNearBalance, setMinNearBalance] = useState("0")
  const { data, isFetched } = useGetViewAccount(accountId)

  useEffect(() => {
    if (isFetched && data?.result?.storage_usage) {
      const minNearBalance = minimumNearBalance(data.result.storage_usage)
      setMinNearBalance(BigNumber.from(minNearBalance).toString())
    }
  }, [data, isFetched])

  return {
    minNearBalance,
  }
}

import { useState } from "react"

import { useGetViewAccount } from "@src/api/hooks/account/useGetViewAccount"

export const useMinimumNearBalance = (accountId: string | null) => {
  const [minNearBalance, setMinNearBalance] = useState(0)
  const { data, isFetched } = useGetViewAccount(accountId)

  return {
    minNearBalance,
  }
}

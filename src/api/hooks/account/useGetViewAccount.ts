import { useQuery } from "@tanstack/react-query"

import { getViewAccount } from "@src/api/account"

const queryKey = "account"
export const getGetViewAccountKey = [queryKey, "get-view-account"]

export const useGetViewAccount = (accountId: string | null, options = {}) =>
  useQuery({
    queryKey: getGetViewAccountKey,
    queryFn: () => getViewAccount(accountId),
    ...options,
  })

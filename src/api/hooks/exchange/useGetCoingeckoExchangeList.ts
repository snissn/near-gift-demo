import { useQuery } from "@tanstack/react-query"

import { getTrendingList } from "@src/libs/de-sdk/providers/coingeckoProvider"

const queryKey = "exchange"
export const getCoingeckoExchangeListKey = [
  queryKey,
  "get-coingecko-exchange-list",
]

export const useGetCoingeckoExchangeList = (id?: string, options = {}) =>
  useQuery({
    queryKey: [...getCoingeckoExchangeListKey, id],
    queryFn: () => getTrendingList(id),
    ...options,
    staleTime: 60 * 5000, // 5 min
  })

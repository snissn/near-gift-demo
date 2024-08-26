import { useQuery } from "@tanstack/react-query"

import { getTrendingList } from "@src/libs/de-sdk/providers/coingeckoProvider"

const queryKey = "exchange"
export const getCoingeckoExchangeListKey = [
  queryKey,
  "get-coingecko-exchange-list",
]

export const useGetCoingeckoExchangeList = (options = {}) =>
  useQuery({
    queryKey: getCoingeckoExchangeListKey,
    queryFn: () => getTrendingList("ref_finance"),
    ...options,
  })

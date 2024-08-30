import { useMutation } from "@tanstack/react-query"

import { getDiscoverDefuseAssets } from "../../token"

const tokenKey = "token"
export const getDiscoverDefuseAssetsKey = [
  tokenKey,
  "get-discover-defuse-assets",
]

export const useDiscoverDefuseAssets = (options = {}) =>
  useMutation({
    mutationKey: getDiscoverDefuseAssetsKey,
    mutationFn: (address: string) => getDiscoverDefuseAssets(address),
    ...options,
  })

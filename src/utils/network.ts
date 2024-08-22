import parseDefuseAsset from "@src/utils/parseDefuseAsset"
import { BlockchainEnum } from "@src/types/interfaces"

export function isForeignNetworkToken(defuseAssetId: string): boolean {
  const keys = defuseAssetId.split(":")
  if (keys.length) {
    const [chain] = keys
    return chain !== "near"
  }
  return false
}

export function networkLabelAdapter(defuseAssetId: string) {
  const result = parseDefuseAsset(defuseAssetId)
  const blockchain = result?.blockchain ?? ""
  switch (blockchain) {
    case BlockchainEnum.Near:
      return "Near"
    case BlockchainEnum.Eth:
      return "Ethereum"
    case BlockchainEnum.Btc:
      return "Bitcoin"
    default:
      return ""
  }
}

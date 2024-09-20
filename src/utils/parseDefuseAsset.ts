export type ParseDefuseAssetResult = {
  blockchain: string
  network: string
  contractId: string
} | null

export default function parseDefuseAsset(
  defuseAssetId: string
): ParseDefuseAssetResult {
  try {
    const [blockchain, network, contractId] = defuseAssetId.split(":")
    return {
      blockchain,
      network,
      contractId,
    }
  } catch (e) {
    console.error("Failed to parse defuse asset id", e)
    return null
  }
}

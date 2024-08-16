import { NetworkToken } from "@src/types/interfaces"

export default function isSameToken(
  token: NetworkToken,
  checkToken: NetworkToken
): boolean {
  return (
    token.address === checkToken?.address &&
    token.chainId === checkToken?.chainId
  )
}

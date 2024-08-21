import { BigNumber } from "ethers"
import { formatUnits } from "viem"

export const smallBalanceToFormat = (balance: string, toFixed = 14): string => {
  if (!parseFloat(balance)) {
    return balance
  }
  const isSmallBalance = parseFloat(balance) < 0.00001
  if (isSmallBalance) {
    return "~0.00001"
  }
  return parseFloat(balance.substring(0, toFixed)).toString()
}

export const smallNumberToString = (balance: number): string => {
  if (parseFloat(balance.toString()) < 0.00001) {
    return parseFloat(balance.toString()).toFixed(8).toString()
  }
  return balance.toString()
}

export const tokenBalanceToFormatUnits = ({
  balance,
  decimals,
}: {
  balance: string | BigNumber | undefined
  decimals: number
}): string => {
  const balanceToString =
    balance !== undefined ? BigNumber.from(balance || "0").toString() : "0"
  if (!parseFloat(balanceToString)) {
    return "0"
  }
  const balanceToUnits = formatUnits(
    BigInt(balanceToString),
    decimals
  ).toString()

  return smallBalanceToFormat(balanceToUnits, 7)
}

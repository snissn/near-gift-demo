import { BigNumber } from "ethers"
import { formatUnits, parseUnits } from "viem"

export const balanceToDecimal = (balance: string, decimal: number): string => {
  const bigNumberBalance = BigNumber.from(balance)
  return formatUnits(BigInt(bigNumberBalance.toString()), decimal)
}

export const balanceToBignumberString = (
  balance: string,
  decimal: number
): string => {
  return parseUnits(balance, decimal).toString()
}

export const balanceToCurrency = (balance: number): number => {
  const roundedValue = Math.ceil(balance * 100) / 100
  return Number(roundedValue.toFixed(2))
}

export const safeBalanceToDecimal = (
  balance: string,
  decimal: number
): string => {
  try {
    if (balance.includes(".")) {
      return balance
    }
    return balanceToDecimal(balance, decimal)
  } catch (e) {
    return balance
  }
}

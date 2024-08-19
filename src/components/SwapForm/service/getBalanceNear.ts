import { formatUnits } from "viem"

import { nearAccount } from "@src/utils/near"
import {
  NEAR_MIN_RESERVE_BALANCE,
  NEAR_STORAGE_COST_PRE_BYTE,
} from "@src/constants/contracts"

export const minimumNearBalance = (storageUsed: number): number => {
  const storageCostPerByte = NEAR_STORAGE_COST_PRE_BYTE
  const calculateMinBalance = storageUsed * storageCostPerByte
  return storageUsed <= 770
    ? 0
    : calculateMinBalance > NEAR_MIN_RESERVE_BALANCE
      ? calculateMinBalance
      : NEAR_MIN_RESERVE_BALANCE
}

export const getBalanceNear = async (accountId: string) => {
  try {
    const viewAccount = await nearAccount(accountId)
    if (!viewAccount) {
      return 0
    }
    const formattedAmountOut = formatUnits(BigInt(viewAccount.amount), 24)

    return (
      parseFloat(formattedAmountOut) -
      minimumNearBalance(viewAccount.storage_usage)
    )
  } catch (e) {
    console.error("Failed to get Near balance", e)
    return 0
  }
}

import { BigNumber } from "ethers"

import { nearAccount } from "@src/utils/near"

// See source here - https://github.com/near/nearcore/blob/master/core/parameters/res/runtime_configs/parameters.yaml#L28
const STORAGE_COST_PER_BYTE = "10000000000000000000" // Equal to 0.00001

export const minimumNearBalance = (storageUsed: number): BigNumber => {
  if (storageUsed <= 770) {
    return BigNumber.from("0")
  }
  const storageUsedBigNumber = BigNumber.from(storageUsed)
  const storageCostPerByteBigNumber = BigNumber.from(STORAGE_COST_PER_BYTE)
  return storageUsedBigNumber.mul(storageCostPerByteBigNumber)
}

export const getBalanceNearAllowedToSwap = async (
  accountId: string
): Promise<string> => {
  try {
    const viewAccount = await nearAccount(accountId)
    if (!viewAccount) {
      return "0"
    }
    const bigNumberBalance = BigNumber.from(viewAccount.amount)
    const balanceAllowedToSwap = bigNumberBalance.sub(
      minimumNearBalance(viewAccount.storage_usage)
    )
    return balanceAllowedToSwap.gte("0") ? balanceAllowedToSwap.toString() : "0"
  } catch (e) {
    console.error("Failed to get Near balance", e)
    return "0"
  }
}

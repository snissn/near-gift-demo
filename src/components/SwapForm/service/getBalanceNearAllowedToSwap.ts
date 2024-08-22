import { formatUnits } from "viem"

import { nearAccount } from "@src/utils/near"

export const minimumNearBalance = (storageUsed: number): number => {
  const storageCostPerByte = 0.00001 // See source here - https://github.com/near/nearcore/blob/master/core/parameters/res/runtime_configs/parameters.yaml#L28
  const minReserveBalance = 1 // TODO Temp, this value should be removed and used only `calculateMinBalance` when we will estimate gas used per tx
  const calculateMinBalance = storageUsed * storageCostPerByte
  return storageUsed <= 770
    ? 0
    : calculateMinBalance > minReserveBalance
      ? calculateMinBalance
      : minReserveBalance
}

export const getBalanceNearAllowedToSwap = async (
  accountId: string
): Promise<number> => {
  try {
    const viewAccount = await nearAccount(accountId)
    if (!viewAccount) {
      return 0
    }
    const formattedAmountOut = formatUnits(BigInt(viewAccount.amount), 24)
    const balanceAllowedToSwap =
      parseFloat(formattedAmountOut) -
      minimumNearBalance(viewAccount.storage_usage)

    return balanceAllowedToSwap > 0 ? balanceAllowedToSwap : 0
  } catch (e) {
    console.error("Failed to get Near balance", e)
    return 0
  }
}

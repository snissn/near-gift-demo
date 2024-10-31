import type { WalletSelector } from "@near-wallet-selector/core"

import {
  FT_STORAGE_DEPOSIT_GAS,
  FT_WITHDRAW_GAS,
} from "@src/constants/contracts"
import { TransactionMethod } from "@src/types/solver0"

type Props = {
  accountId: string | null
  selector: WalletSelector | null
}

const useSwapNearToWNear = ({ selector }: Props) => {
  const callRequestNearDeposit = async (
    contractAddress: string,
    deposit: string
  ) => {
    assert(selector, "Wallet selector is not initialized")
    const wallet = await selector.wallet()
    return await wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: contractAddress,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: TransactionMethod.NEAR_DEPOSIT,
                args: {},
                gas: FT_STORAGE_DEPOSIT_GAS,
                deposit,
              },
            },
          ],
        },
      ],
    })
  }

  const callRequestNearWithdraw = async (
    contractAddress: string,
    amount: string
  ) => {
    assert(selector, "Wallet selector is not initialized")
    const wallet = await selector.wallet()
    return await wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: contractAddress,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: TransactionMethod.NEAR_WITHDRAW,
                args: {
                  amount,
                },
                gas: FT_WITHDRAW_GAS,
                deposit: "1",
              },
            },
          ],
        },
      ],
    })
  }

  return {
    callRequestNearDeposit,
    callRequestNearWithdraw,
  }
}

export default useSwapNearToWNear

function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg)
  }
}

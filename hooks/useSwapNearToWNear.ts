import { WalletSelector } from "@near-wallet-selector/core"

import { FT_STORAGE_DEPOSIT_GAS } from "@/constants/contracts"

type Props = {
  accountId: string | null
  selector: WalletSelector | null
}

const useSwapNearToWNear = ({ accountId, selector }: Props) => {
  const callRequestNearDeposit = async (
    contractAddress: string,
    deposit: string
  ) => {
    const wallet = await selector!.wallet()
    return await wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: contractAddress,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "near_deposit",
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

  return {
    callRequestNearDeposit,
  }
}

export default useSwapNearToWNear

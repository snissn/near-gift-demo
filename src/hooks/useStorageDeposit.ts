import { WalletSelector } from "@near-wallet-selector/core"

import {
  CONTRACTS_REGISTER,
  FT_MINIMUM_STORAGE_BALANCE_LARGE,
  FT_STORAGE_DEPOSIT_GAS,
  MAX_GAS_TRANSACTION,
} from "@src/constants/contracts"
import { storageBalance } from "@src/utils/near"

type Props = {
  accountId: string | null
  selector: WalletSelector | null
}

const useStorageDeposit = ({ accountId, selector }: Props) => {
  const getStorageBalance = async (
    contractAddress: string,
    receiver: string
  ) => {
    return await storageBalance(contractAddress, receiver)
  }

  const setStorageDeposit = async (
    contractAddress: string,
    receiver: string
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
                methodName: "storage_deposit",
                args: {
                  account_id: receiver,
                  registration_only: true,
                },
                gas: FT_STORAGE_DEPOSIT_GAS,
                deposit: FT_MINIMUM_STORAGE_BALANCE_LARGE,
              },
            },
          ],
        },
      ],
    })
  }

  return {
    getStorageBalance,
    setStorageDeposit,
  }
}

export default useStorageDeposit

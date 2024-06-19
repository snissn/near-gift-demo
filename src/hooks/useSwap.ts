"use client"

import { useId, useState } from "react"
import { WalletSelector } from "@near-wallet-selector/core"
import * as borsh from "borsh"
import { parseUnits } from "viem"

import {
  CONTRACTS_REGISTER,
  MAX_GAS_TRANSACTION,
} from "@src/constants/contracts"
import { sha256 } from "@src/actions/crypto"
import { NetworkToken } from "@src/types/interfaces"
import { swapSchema } from "@src/utils/schema"
import useStorageDeposit from "@src/hooks/useStorageDeposit"
import useNearSwapNearToWNear from "@src/hooks/useSwapNearToWNear"
import { SUPPORTED_TOKENS } from "@src/constants/tokens"

type Props = {
  accountId: string | null
  selector: WalletSelector | null
}
type CallRequestIntentProps = {
  inputAmount: string
  outputAmount: string
  inputToken: NetworkToken
  outputToken: NetworkToken
}

export const useSwap = ({ accountId, selector }: Props) => {
  const clientSwapId = useId()
  const [transactionQueue, setTransactionQueue] = useState(1)
  const { getStorageBalance, setStorageDeposit } = useStorageDeposit({
    accountId,
    selector,
  })
  const { callRequestNearDeposit } = useNearSwapNearToWNear({
    accountId,
    selector,
  })

  const callRequestCreateIntent = async ({
    inputAmount,
    outputAmount,
    inputToken,
    outputToken,
  }: CallRequestIntentProps) => {
    if (!accountId) console.log("Non valid recipient address")
    if (!inputToken?.address) console.log("Non valid contract address")

    const balance = await getStorageBalance(
      inputToken!.address as string,
      CONTRACTS_REGISTER.INTENT
    )

    if (inputToken?.address && !Number(balance?.toString() || "0")) {
      setTransactionQueue(transactionQueue + 1)
      await setStorageDeposit(
        inputToken!.address as string,
        CONTRACTS_REGISTER.INTENT
      )
    }

    const intent_account_id = await sha256(clientSwapId)

    const unitsSendAmount = parseUnits(
      inputAmount,
      inputToken?.decimals as number
    ).toString()
    const estimateUnitsBackAmount = parseUnits(
      outputAmount,
      outputToken?.decimals as number
    ).toString()

    const getBlock = 123_456 // Current block + 10
    const referral = "referral.near" // Some referral account

    // TODO If wNear user amount less than amountIn and Near user amount cover left part then do deposit
    // if (!inputToken?.address) {
    //   await callRequestNearDeposit(SUPPORTED_TOKENS.wNEAR, unitsSendAmount)
    // }

    const msg = {
      CreateIntent: {
        id: intent_account_id,
        IntentStruct: {
          initiator: accountId,
          send: {
            token_id: inputToken!.address,
            amount: unitsSendAmount,
          },
          receive: {
            token_id: outputToken!.address,
            amount: estimateUnitsBackAmount,
          },
          expiration: {
            Block: getBlock,
          },
          referral: {
            Some: referral,
          },
        },
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msgBorsh = borsh.serialize(swapSchema as any, msg)

    const wallet = await selector!.wallet()
    await wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: inputToken!.address as string,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "ft_transfer_call",
                args: {
                  receiver_id: CONTRACTS_REGISTER.INTENT,
                  amount: unitsSendAmount,
                  memo: "Execute intent: NEP-141 to NEP-141",
                  msg: Buffer.from(msgBorsh).toString("base64"),
                },
                gas: MAX_GAS_TRANSACTION,
                deposit: "1",
              },
            },
          ],
        },
      ],
    })
  }

  return {
    callRequestCreateIntent,
    transactionQueue,
  }
}

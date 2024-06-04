"use client"

import { useState } from "react"
import { WalletSelector } from "@near-wallet-selector/core"
import { serialize as serializeBorsh } from "near-api-js/lib/utils/serialize"
import * as borsh from "borsh"
import { parseUnits } from "viem"

import { CONTRACTS_REGISTER, MAX_GAS_TRANSACTION } from "@/constants/contracts"
import { sha256 } from "@/actions/crypto"
import { Token } from "@/types/interfaces"
import { swapSchema } from "@/utils/schema"
import useStorageDeposit from "@/hooks/useStorageDeposit"

type Props = {
  accountId: string | null
  selector: WalletSelector | null
}
type CallRequestIntentProps = {
  inputAmount: number
}

export const useSwap = ({ accountId, selector }: Props) => {
  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()
  const { getStorageBalance, setStorageDeposit } = useStorageDeposit({
    accountId,
    selector,
  })

  const onChangeInputToken = (token?: Token) => {
    setInputToken(token)
  }

  const onChangeOutputToken = (token?: Token) => {
    setOutputToken(token)
  }

  const callRequestIntent = async ({ inputAmount }: CallRequestIntentProps) => {
    if (!accountId) console.log("Non valid recipient address")
    if (!inputToken?.address) console.log("Non valid contract address")

    const balance = await getStorageBalance(
      inputToken!.address,
      CONTRACTS_REGISTER.INTENT
    )

    if (!Number(balance?.toString() || "0")) {
      await setStorageDeposit(inputToken!.address, CONTRACTS_REGISTER.INTENT)
    }

    const intent_account_id = await sha256("1")
    const unitsSendAmount = parseUnits(
      String(inputAmount),
      inputToken?.decimals as number
    ).toString()

    // TODO Execute for Solver event
    // const value = { ExecuteIntent: "1".toString() }
    // const encoded = borsh.serialize(schema, value)

    // TODO Has to be estimated by Solver
    //      [optional] could be estimated with Coingecko Api
    const estimateUnitsBackAmount = unitsSendAmount

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
            Block: 123_456,
          },
          referral: {
            Some: "referral.near",
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
          receiverId: inputToken!.address,
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
    onChangeInputToken,
    onChangeOutputToken,
    callRequestIntent,
  }
}

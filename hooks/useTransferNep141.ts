"use client"

import { useState } from "react"
import { parseUnits } from "viem"
import BN from "bn.js"
import { ErrorResponse } from "@walletconnect/jsonrpc-types"

import { useWalletSelector } from "@/providers/WalletSelectorProvider"
import { nearAccount, nep141Balance, storageBalance } from "@/utils/near"
import {
  FT_MINIMUM_STORAGE_BALANCE_LARGE,
  FT_STORAGE_DEPOSIT_GAS,
  FT_TRANSFER_GAS,
  TOKEN_TRANSFER_DEPOSIT,
} from "@/constants/contracts"
import {
  SUPPORTED_TOKENS,
  TOKEN,
  TOKENS,
  TokenEnum,
  Token,
} from "@/constants/tokens"

type TokenBalances = {
  [key: string]: string
}

const useTransferNep141 = () => {
  const [amount, setAmount] = useState("")
  const [tokenContract, setTokenContract] = useState(SUPPORTED_TOKENS.REF)
  const [receiver, setReceiver] = useState("")
  const [balances, setBalances] = useState<TokenBalances | null>(null)
  const [sendingTx, setIsSendingTx] = useState(false)
  const { selector, accountId } = useWalletSelector()

  async function transferNearToken() {
    try {
      const wallet = await selector.wallet()
      if (!accountId) throw { message: "Connect wallet first" }
      if (!tokenContract) throw { message: "Token not selected" }
      if (balances === null) throw { message: "Balances not fetched" }

      const sendTokenUserBalance = balances[tokenContract]
      // if (sendTokenUserBalance === null)
      //   throw {
      //     message: `Not enough balance to send ${TOKENS[tokenContract].symbol}`,
      //   }
      const bnSendTokenUserBalance = new BN(sendTokenUserBalance)
      // if (bnSendTokenUserBalance.isZero())
      //   throw {
      //     message: `Not enough balance to send ${TOKENS[tokenContract].symbol}`,
      //   }
      const formatedReceiver = receiver.trim().toLowerCase()
      if (formatedReceiver === "")
        throw { message: "Non valid recipient address" }
      const trimmedAmount = amount.trim()
      if (trimmedAmount === "") throw { message: "Empty amount" }
      const formattedNumber = +trimmedAmount
      if (Number.isNaN(formattedNumber))
        throw { message: "Non valid amount to send" }
      const unitsSendAmount = parseUnits(
        trimmedAmount,
        TOKENS[tokenContract as unknown as keyof TokenEnum].decimals
      ).toString()

      const bnSendAmount = new BN(unitsSendAmount)
      if (bnSendAmount.isZero()) throw { message: "Can't send zero tokens" }
      if (bnSendAmount.gt(bnSendTokenUserBalance))
        throw { message: "Send amount greater than available amount" }

      setIsSendingTx(true)
      const receiverAcc = await nearAccount(formatedReceiver)
      if (receiverAcc === null) {
        throw { message: "Receiver acc doesn't exist" }
      }

      const balance = await storageBalance(formatedReceiver, tokenContract)

      console.log("Receiver storage balance", balance)

      if (balance === null) {
        const storageDepositTx = await wallet.signAndSendTransaction({
          receiverId: tokenContract,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "storage_deposit",
                args: {
                  account_id: formatedReceiver,
                  registration_only: true,
                },
                gas: FT_STORAGE_DEPOSIT_GAS,
                deposit: FT_MINIMUM_STORAGE_BALANCE_LARGE,
              },
            },
          ],
        })
        console.log("storageDepositTx", storageDepositTx)
      }

      const result = await wallet.signAndSendTransaction({
        signerId: accountId!,
        receiverId: tokenContract,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "ft_transfer",
              args: {
                receiver_id: formatedReceiver,
                amount: unitsSendAmount,
              },
              gas: FT_TRANSFER_GAS,
              deposit: TOKEN_TRANSFER_DEPOSIT,
            },
          },
        ],
      })

      if (!result) throw { message: "Failed to send a TX" }
      console.log(result)
      alert(
        `Success\n
        \ntx link - https://testnet.nearblocks.io/txns/${result.transaction.hash}`
      )
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message || "Failed to send tx")
      } else {
        alert("Failed to send tx")
      }
    } finally {
      setTimeout(fetchTokensBalances, 2000)
      setIsSendingTx(false)
    }
  }

  async function fetchTokensBalances() {
    try {
      if (!accountId) return
      const tokenPriceData = {} as TokenBalances
      // TODO Rewrite balances fetching
      // await Promise.all(
      //   Object.keys(TOKENS).map(async (contract) =>
      //     (async () => {
      //       const balance = await nep141Balance(accountId, contract)
      //       tokenPriceData[contract as unknown as string] = balance
      //     })()
      //   )
      // )
      // setBalances(tokenPriceData)
    } catch (e) {
      console.error("Failed to fetch Near balance", e)
    }
  }

  return {
    transferNearToken,
  }
}

export default useTransferNep141

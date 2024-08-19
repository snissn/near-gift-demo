"use client"

import { WalletSelector } from "@near-wallet-selector/core"
import { parseUnits } from "viem"
import { BigNumber } from "ethers"
import { useState } from "react"

import {
  CONTRACTS_REGISTER,
  FT_MINIMUM_STORAGE_BALANCE_LARGE,
  FT_STORAGE_DEPOSIT_GAS,
  FT_WITHDRAW_GAS,
  INDEXER,
  MAX_GAS_TRANSACTION,
} from "@src/constants/contracts"
import {
  NearTX,
  NetworkToken,
  QueueTransactions,
  Result,
  ContractIdEnum,
  BlockchainEnum,
} from "@src/types/interfaces"
import useStorageDeposit from "@src/hooks/useStorageDeposit"
import useNearSwapNearToWNear from "@src/hooks/useSwapNearToWNear"
import { useNearBlock } from "@src/hooks/useNearBlock"
import { getNearTransactionDetails } from "@src/api/transaction"
import { useTransactionScan } from "@src/hooks/useTransactionScan"
import { LIST_NATIVE_TOKENS } from "@src/constants/tokens"
import { mapCreateIntentTransactionCall } from "@src/libs/de-sdk/utils/maps"
import { isForeignNetworkToken } from "@src/utils/network"
import { TransactionMethod } from "@src/types/solver0"
import { getBalanceNear } from "@src/components/SwapForm/service/getBalanceNear"

type Props = {
  accountId: string | null
  selector: WalletSelector | null
}

export type EstimateQueueTransactions = {
  queueTransactionsTrack: QueueTransactions[]
  queueInTrack: number
}

export type NextEstimateQueueTransactionsProps = {
  estimateQueue: EstimateQueueTransactions
  receivedHash: string
}

export type NextEstimateQueueTransactionsResult = {
  value: EstimateQueueTransactions
  done: boolean
}

type WithAccounts = {
  accountFrom?: string
  accountTo?: string
}

export interface CallRequestIntentProps extends WithAccounts {
  tokenIn: string
  tokenOut: string
  selectedTokenIn: NetworkToken
  selectedTokenOut: NetworkToken
  estimateQueue: EstimateQueueTransactions
  clientId?: string
  solverId?: string
}

export const useSwap = ({ accountId, selector }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isError, setIsError] = useState("")
  const { getStorageBalance, setStorageDeposit } = useStorageDeposit({
    accountId,
    selector,
  })
  const { callRequestNearWithdraw } = useNearSwapNearToWNear({
    accountId,
    selector,
  })
  const { getNearBlock } = useNearBlock()
  const { getTransactionScan } = useTransactionScan()

  const handleError = (e: unknown) => {
    console.error(e)
    if (e instanceof Error) {
      setIsError(e.message)
    } else {
      setIsError("An unexpected error occurred!")
    }
  }

  const isValidInputs = (inputs: CallRequestIntentProps): boolean => {
    if (!accountId) {
      console.log("Non valid recipient address")
      return false
    }
    if (!inputs!.selectedTokenIn?.address) {
      console.log("Non valid contract address")
      return false
    }
    if (!inputs?.clientId) {
      console.log("Non valid clientId")
      return false
    }
    return true
  }
  const isValidEstimateQueue = (
    queueTransaction?: EstimateQueueTransactions
  ) => {
    if (!queueTransaction?.queueTransactionsTrack?.length) {
      console.log("Non valid queueTransactionsTrack")
      return false
    }
    return true
  }

  const getEstimateQueueTransactions = async (
    inputs: Omit<
      Pick<
        CallRequestIntentProps,
        | "tokenIn"
        | "tokenOut"
        | "selectedTokenIn"
        | "selectedTokenOut"
        | "clientId"
      >,
      "estimateQueue"
    >
  ): Promise<EstimateQueueTransactions> => {
    try {
      let queue = 1
      const queueTransaction = [QueueTransactions.CREATE_INTENT]

      if (!isValidInputs(inputs as CallRequestIntentProps)) {
        return {
          queueInTrack: 0,
          queueTransactionsTrack: [],
        }
      }

      const { selectedTokenIn, selectedTokenOut, tokenIn } = inputs

      const [network, chain, address] =
        selectedTokenIn.defuse_asset_id.split(":")
      if (
        network === BlockchainEnum.Near &&
        address === ContractIdEnum.Native &&
        accountId
      ) {
        const balanceNear = await getBalanceNear(accountId)
        if (Number(tokenIn) > balanceNear) {
          queueTransaction.unshift(QueueTransactions.WITHDRAW)
          queue++
        }
      }

      const isNativeTokenIn = selectedTokenIn!.address === "native"
      const tokenNearNative = LIST_NATIVE_TOKENS.find(
        (token) => token.defuse_asset_id === "near:mainnet:native"
      )
      const storageBalanceTokenInAddress = isNativeTokenIn
        ? tokenNearNative!.routes
          ? tokenNearNative!.routes[0]
          : ""
        : selectedTokenIn!.address
      // Estimate if user did storage before in order to transfer tokens for swap
      const storageBalanceTokenIn = await getStorageBalance(
        storageBalanceTokenInAddress as string,
        accountId as string
      )
      if (!isForeignNetworkToken(selectedTokenIn.defuse_asset_id)) {
        const storageBalanceTokenInToString = BigNumber.from(
          storageBalanceTokenIn
        ).toString()
        console.log(
          "useSwap storageBalanceTokenIn: ",
          storageBalanceTokenInToString
        )
        if (!parseFloat(storageBalanceTokenInToString)) {
          queueTransaction.unshift(QueueTransactions.STORAGE_DEPOSIT_TOKEN_IN)
          queue++
        }
      }

      const isNativeTokenOut = selectedTokenOut!.address === "native"
      // Estimate if user did storage before in order to transfer tokens for swap
      const storageBalanceTokenOut = await getStorageBalance(
        selectedTokenOut!.address as string,
        accountId as string
      )
      if (
        !isForeignNetworkToken(selectedTokenOut.defuse_asset_id) &&
        !isNativeTokenOut
      ) {
        const storageBalanceTokenOutToString = BigNumber.from(
          storageBalanceTokenOut
        ).toString()
        console.log(
          "useSwap storageBalanceTokenOut: ",
          storageBalanceTokenOutToString
        )
        if (!parseFloat(storageBalanceTokenOutToString)) {
          queueTransaction.unshift(QueueTransactions.STORAGE_DEPOSIT_TOKEN_OUT)
          queue++
        }
      }

      return {
        queueInTrack: queue,
        queueTransactionsTrack: queueTransaction,
      }
    } catch (e) {
      handleError(e)
      return {
        queueInTrack: 0,
        queueTransactionsTrack: [],
      }
    }
  }

  const nextEstimateQueueTransactions = async ({
    estimateQueue,
    receivedHash,
  }: NextEstimateQueueTransactionsProps): Promise<NextEstimateQueueTransactionsResult> => {
    try {
      const { result } = (await getNearTransactionDetails(
        receivedHash as string,
        accountId as string
      )) as Result<NearTX>
      const { isFailure } = await getTransactionScan(result)

      if (isFailure) {
        return {
          value: estimateQueue,
          done: false,
        }
      }

      const updateEstimateQueue = estimateQueue?.queueTransactionsTrack
      updateEstimateQueue?.shift()
      return {
        value: {
          queueTransactionsTrack: updateEstimateQueue,
          queueInTrack: updateEstimateQueue!.length,
        },
        done: updateEstimateQueue!.length ? false : true,
      } as NextEstimateQueueTransactionsResult
    } catch (e) {
      handleError(e)
      return {
        value: estimateQueue,
        done: false,
      }
    }
  }

  const callRequestCreateIntent = async (
    inputs: CallRequestIntentProps,
    mutate?: (input: CallRequestIntentProps) => void
  ): Promise<NearTX[] | void> => {
    try {
      if (
        !isValidInputs(inputs) &&
        !isValidEstimateQueue(inputs?.estimateQueue)
      )
        return
      const {
        tokenIn,
        tokenOut,
        selectedTokenIn,
        selectedTokenOut,
        clientId,
        estimateQueue,
        accountFrom,
        accountTo,
        solverId,
      } = inputs

      setIsProcessing(true)

      const getBlock = await getNearBlock()

      // TODO Update type to NearTX[] | void
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let transactionResult: any | void = undefined

      const isWithdrawInTrack = estimateQueue.queueTransactionsTrack.includes(
        QueueTransactions.WITHDRAW
      )

      let balanceNear = 0
      if (isWithdrawInTrack && accountId) {
        balanceNear = await getBalanceNear(accountId)
      }

      if (
        estimateQueue?.queueTransactionsTrack?.length === 1 ||
        isWithdrawInTrack
      ) {
        const currentQueue: QueueTransactions =
          estimateQueue!.queueTransactionsTrack[0]

        switch (currentQueue) {
          case QueueTransactions.WITHDRAW:
            if (selectedTokenIn?.address && accountId) {
              const unitsSendAmount = parseUnits(
                (Number(tokenIn) - balanceNear).toString(),
                selectedTokenIn?.decimals as number
              ).toString()
              transactionResult = await callRequestNearWithdraw(
                "wrap.near",
                unitsSendAmount
              )
            }
            break

          case QueueTransactions.STORAGE_DEPOSIT_TOKEN_IN:
            const storageBalanceTokenIn = await getStorageBalance(
              selectedTokenIn!.address as string,
              accountId as string
            )
            if (
              selectedTokenIn?.address &&
              !Number(storageBalanceTokenIn?.toString() || "0")
            ) {
              transactionResult = await setStorageDeposit(
                selectedTokenIn!.address as string,
                accountId as string
              )
            }
            break

          case QueueTransactions.STORAGE_DEPOSIT_TOKEN_OUT:
            const storageBalanceTokenOut = await getStorageBalance(
              selectedTokenOut!.address as string,
              accountId as string
            )
            if (
              selectedTokenOut?.address &&
              !Number(storageBalanceTokenOut?.toString() || "0")
            ) {
              transactionResult = await setStorageDeposit(
                selectedTokenOut!.address as string,
                accountId as string
              )
            }
            break

          case QueueTransactions.CREATE_INTENT:
            const wallet = await selector!.wallet()
            const getIntentsTransactionCall = mapCreateIntentTransactionCall({
              tokenIn,
              tokenOut,
              selectedTokenIn,
              selectedTokenOut,
              clientId,
              blockHeight: getBlock.height,
              accountId,
              accountFrom,
              accountTo,
              solverId,
            })
            // TODO Concurrent mode for intents where selection is picked by criteria
            const findFirst = getIntentsTransactionCall.find(
              ([intentId, transaction]) => intentId === 0 || intentId === 1
            )
            if (!findFirst) {
              throw new Error("getIntentsTransactionCall - intent is not found")
            }
            transactionResult = await wallet.signAndSendTransactions({
              transactions: [findFirst[1]],
            })
            break
        }

        setIsProcessing(false)
        return transactionResult
      }

      const receiverIdIn = selectedTokenIn!.address as string
      const receiverIdOut = selectedTokenOut!.address as string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transactions: { receiverId: string; actions: any }[] = []
      const mutateEstimateQueue = inputs.estimateQueue
      let tempQueueTransactionsTrack = []

      estimateQueue.queueTransactionsTrack.forEach((queueTransaction) => {
        switch (queueTransaction) {
          case QueueTransactions.WITHDRAW:
            if (selectedTokenIn?.address && accountId) {
              const leftAmountIn = Number(tokenIn) - balanceNear
              const unitsSendAmount = parseUnits(
                leftAmountIn.toString(),
                selectedTokenIn?.decimals as number
              ).toString()
              transactions.push({
                receiverId: receiverIdIn,
                actions: [
                  {
                    type: "FunctionCall",
                    params: {
                      methodName: TransactionMethod.NEAR_WITHDRAW,
                      args: {
                        amount: unitsSendAmount,
                      },
                      gas: FT_WITHDRAW_GAS,
                      deposit: "1",
                    },
                  },
                ],
              })
              mutateEstimateQueue.queueInTrack--
              tempQueueTransactionsTrack =
                mutateEstimateQueue.queueTransactionsTrack.filter(
                  (queue) => queue !== QueueTransactions.WITHDRAW
                )
              mutateEstimateQueue.queueTransactionsTrack =
                tempQueueTransactionsTrack
            }
            break
          case QueueTransactions.STORAGE_DEPOSIT_TOKEN_IN:
            transactions.push({
              receiverId: receiverIdIn,
              actions: [
                {
                  type: "FunctionCall",
                  params: {
                    methodName: TransactionMethod.STORAGE_DEPOSIT,
                    args: {
                      account_id: accountId as string,
                      registration_only: true,
                    },
                    gas: FT_STORAGE_DEPOSIT_GAS,
                    deposit: FT_MINIMUM_STORAGE_BALANCE_LARGE,
                  },
                },
              ],
            })
            mutateEstimateQueue.queueInTrack--
            tempQueueTransactionsTrack =
              mutateEstimateQueue.queueTransactionsTrack.filter(
                (queue) => queue !== QueueTransactions.STORAGE_DEPOSIT_TOKEN_IN
              )
            mutateEstimateQueue.queueTransactionsTrack =
              tempQueueTransactionsTrack
            break
          case QueueTransactions.STORAGE_DEPOSIT_TOKEN_OUT:
            transactions.push({
              receiverId: receiverIdOut,
              actions: [
                {
                  type: "FunctionCall",
                  params: {
                    methodName: TransactionMethod.STORAGE_DEPOSIT,
                    args: {
                      account_id: accountId as string,
                      registration_only: true,
                    },
                    gas: FT_STORAGE_DEPOSIT_GAS,
                    deposit: FT_MINIMUM_STORAGE_BALANCE_LARGE,
                  },
                },
              ],
            })
            mutateEstimateQueue.queueInTrack--
            tempQueueTransactionsTrack =
              mutateEstimateQueue.queueTransactionsTrack.filter(
                (queue) => queue !== QueueTransactions.STORAGE_DEPOSIT_TOKEN_OUT
              )
            mutateEstimateQueue.queueTransactionsTrack =
              tempQueueTransactionsTrack
            break
          case QueueTransactions.CREATE_INTENT:
            const getIntentsTransactionCall = mapCreateIntentTransactionCall({
              tokenIn,
              tokenOut,
              selectedTokenIn,
              selectedTokenOut,
              clientId,
              blockHeight: getBlock.height,
              accountId,
              accountFrom,
              accountTo,
              solverId,
            })
            // TODO Concurrent mode for intents where selection is picked by criteria
            const findFirst = getIntentsTransactionCall.find(
              ([intentId, transaction]) => intentId === 0 || intentId === 1
            )
            if (!findFirst) {
              throw new Error("getIntentsTransactionCall - intent is not found")
            }
            transactions.push(findFirst[1])
            break
        }
      })

      mutate &&
        mutate({
          ...inputs,
          estimateQueue: mutateEstimateQueue,
        })

      const wallet = await selector!.wallet()
      transactionResult = await wallet.signAndSendTransactions({
        transactions: transactions.filter((tx) => tx.actions.length),
      })

      setIsProcessing(false)
      return transactionResult
    } catch (e) {
      handleError(e)
    }
  }

  const callRequestRollbackIntent = async (inputs: {
    id: string
    receiverId?: string
  }) => {
    try {
      const wallet = await selector!.wallet()
      await wallet.signAndSendTransactions({
        transactions: [
          {
            receiverId:
              inputs?.receiverId ?? CONTRACTS_REGISTER[INDEXER.INTENT_0],
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: TransactionMethod.ROLLBACK_INTENT,
                  args: {
                    id: inputs.id,
                  },
                  gas: MAX_GAS_TRANSACTION,
                  deposit:
                    inputs?.receiverId !== CONTRACTS_REGISTER[INDEXER.INTENT_0]
                      ? "1"
                      : "0",
                },
              },
            ],
          },
        ],
      })
    } catch (e) {
      handleError(e)
    }
  }

  return {
    isError,
    isProcessing,
    nextEstimateQueueTransactions,
    getEstimateQueueTransactions,
    callRequestCreateIntent,
    callRequestRollbackIntent,
  }
}

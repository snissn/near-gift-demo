"use client"

import { useState } from "react"
import * as borsh from "borsh"

import { HistoryData, HistoryStatus } from "@src/stores/historyStore"
import { useHistoryStore } from "@src/providers/HistoryStoreProvider"
import { CONFIRM_SWAP_LOCAL_KEY } from "@src/constants/contracts"
import {
  NearIntent1CreateCrossChain,
  NearIntent1CreateSingleChain,
  NearIntentCreate,
  NearTX,
  RecoverDetails,
  Result,
} from "@src/types/interfaces"
import { getNearTransactionDetails } from "@src/api/transaction"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { useTransactionScan } from "@src/hooks/useTransactionScan"
import { swapSchema } from "@src/utils/schema"
import { ModalConfirmSwapPayload } from "@src/components/Modal/ModalConfirmSwap"
import { adapterIntent0, adapterIntent1 } from "@src/libs/de-sdk/utils/adapters"
import { TransactionMethod } from "@src/types/solver0"
import {
  callRequestGetIntent,
  getDetailsFromGetIntent,
  getDetailsFromStorageDeposit,
  GetIntentResult,
  isValidJSON,
  skipFirstCircle,
} from "@src/utils/history"

const SCHEDULER_5_SEC = 5000

export const useHistoryLatest = () => {
  const { accountId } = useWalletSelector()
  const { updateHistory, data } = useHistoryStore((state) => state)
  const [isHistoryWorkerSleeping, setIsHistoryWorkerSleeping] = useState(true)
  const { getTransactionScan } = useTransactionScan()
  const [isMonitoringComplete, setIsMonitoringComplete] = useState({
    cycle: 0,
    done: false,
  })

  const applyDataFromCreateIntent = (
    intentId: string
  ): Partial<HistoryData["details"]> => {
    const details: Partial<HistoryData["details"]> = {}
    if (data.size) {
      data.forEach((history) => {
        const method =
          history.details?.transaction?.actions[0].FunctionCall.method_name
        if (
          history.intentId === intentId &&
          (method === TransactionMethod.FT_TRANSFER_CALL ||
            method === TransactionMethod.NATIVE_ON_TRANSFER)
        ) {
          Object.assign(details, {
            tokenIn: history.details?.tokenIn,
            tokenOut: history.details?.tokenOut,
            selectedTokenIn: history.details?.selectedTokenIn,
            selectedTokenOut: history.details?.selectedTokenOut,
          })
        }
      })
    }
    return details
  }

  const runHistoryMonitoring = async (data: HistoryData[]): Promise<void> => {
    const validHistoryStatuses: string[] = [
      ...adapterIntent0.completedStatuses,
      ...adapterIntent1.completedStatuses,
      HistoryStatus.FAILED,
      HistoryStatus.WITHDRAW,
      HistoryStatus.DEPOSIT,
      skipFirstCircle(HistoryStatus.STORAGE_DEPOSIT), // TODO temporarily skipping first row to fill in the gaps in the storage deposit history
    ]

    const historyCompletion: boolean[] = []
    const result: HistoryData[] = await Promise.all(
      data.map(async (historyData) => {
        if (
          (historyData?.status &&
            validHistoryStatuses.includes(historyData!.status ?? "")) ||
          historyData.errorMessage ||
          historyData.isClosed
        ) {
          historyCompletion.push(true)
          return historyData
        }

        if (!historyData.details?.receipts_outcome) {
          const { result } = (await getNearTransactionDetails(
            historyData.hash as string,
            accountId as string
          )) as Result<NearTX>
          if (result) {
            Object.assign(historyData, {
              details: {
                ...historyData.details,
                receipts_outcome: result.receipts_outcome,
                transaction: result.transaction,
              },
            })
          }
        }

        // Try to recover intentId and "Swap" data in case it was lost
        const transactionMethodName =
          historyData.details?.transaction?.actions.length &&
          historyData.details?.transaction?.actions[0].FunctionCall.method_name
        if (transactionMethodName && historyData.details?.transaction) {
          let getHashedArgs = ""
          let argsJson = ""
          let args: unknown
          let msgBase64 = ""
          let msgBuffer: Buffer
          let getIntent: GetIntentResult
          let recoverData: unknown
          switch (transactionMethodName) {
            case TransactionMethod.FT_TRANSFER_CALL:
              getHashedArgs =
                historyData.details.transaction.actions[0].FunctionCall.args
              argsJson = Buffer.from(getHashedArgs ?? "", "base64").toString(
                "utf-8"
              )
              args = JSON.parse(argsJson)
              msgBase64 = (args as { msg: string }).msg

              if (isValidJSON(msgBase64)) {
                recoverData = JSON.parse(msgBase64)
              }
              if (recoverData === undefined) {
                msgBuffer = Buffer.from(msgBase64, "base64")
                const msgBorshDeserialize = borsh.deserialize(
                  swapSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
                  msgBuffer
                )
                recoverData = msgBorshDeserialize
              }

              const intentId =
                (recoverData as NearIntentCreate)?.CreateIntent?.id ||
                (recoverData as NearIntent1CreateCrossChain)?.id
              const recoverDetails =
                (recoverData as NearIntentCreate).CreateIntent ||
                (recoverData as NearIntent1CreateCrossChain)
              const sendAmount =
                (
                  recoverDetails as NearIntentCreate["CreateIntent"]
                )?.IntentStruct?.send?.amount.toString() ||
                (args as { amount: string })?.amount
              const receiveAmount =
                (
                  recoverDetails as unknown as NearIntentCreate["CreateIntent"]
                )?.IntentStruct?.receive?.amount.toString() ||
                (recoverDetails as unknown as NearIntent1CreateCrossChain)
                  ?.asset_out?.amount
              const expiration = {
                Block:
                  (
                    recoverDetails as unknown as NearIntentCreate["CreateIntent"]
                  )?.IntentStruct?.expiration?.Block.toString() ||
                  (
                    recoverDetails as unknown as NearIntent1CreateCrossChain
                  )?.expiration?.block_number.toString(),
              }

              Object.assign(historyData, {
                intentId,
                details: {
                  ...historyData.details,
                  recoverDetails: {
                    ...recoverDetails,
                    send: {
                      ...(recoverDetails as unknown as RecoverDetails).send,
                      amount: sendAmount,
                    },
                    receive: {
                      ...(recoverDetails as unknown as RecoverDetails).receive,
                      amount: receiveAmount,
                    },
                    expiration,
                    receiverId: (args as { receiver_id: string })?.receiver_id,
                  },
                },
              })

              getIntent = await callRequestGetIntent(
                (args as { receiver_id: string }).receiver_id,
                historyData.intentId
              )
              if (getIntent?.status) {
                Object.assign(historyData, {
                  status: getIntent.status,
                  proof: getIntent?.proof,
                })
              }
              break

            case TransactionMethod.ROLLBACK_INTENT:
              getHashedArgs =
                historyData.details.transaction.actions[0].FunctionCall.args
              argsJson = Buffer.from(getHashedArgs ?? "", "base64").toString(
                "utf-8"
              )
              args = JSON.parse(argsJson)
              Object.assign(historyData, {
                details: {
                  ...historyData.details,
                  ...applyDataFromCreateIntent((args as { id: string }).id),
                },
                intentId: (args as { id: string }).id,
                status: HistoryStatus.ROLLED_BACK,
              })
              break

            case TransactionMethod.NEAR_DEPOSIT:
              getHashedArgs =
                historyData.details.transaction.actions[0].FunctionCall.args
              argsJson = Buffer.from(getHashedArgs ?? "", "base64").toString(
                "utf-8"
              )
              const logMsg = historyData.details?.receipts_outcome
                ? historyData.details?.receipts_outcome[0]!.outcome!.logs[0]
                : undefined
              Object.assign(historyData, {
                status: HistoryStatus.DEPOSIT,
                details: {
                  ...historyData.details,
                  recoverDetails: {
                    msg: logMsg,
                  },
                },
              })
              break

            case TransactionMethod.NEAR_WITHDRAW:
              getHashedArgs =
                historyData.details.transaction.actions[0].FunctionCall.args
              argsJson = Buffer.from(getHashedArgs ?? "", "base64").toString(
                "utf-8"
              )
              args = JSON.parse(argsJson)
              Object.assign(historyData, {
                status: HistoryStatus.WITHDRAW,
                details: {
                  ...historyData.details,
                  recoverDetails: {
                    amount: (args as { amount: string }).amount,
                  },
                },
              })
              break

            case TransactionMethod.STORAGE_DEPOSIT:
              const detailsFromStorageDeposit =
                await getDetailsFromStorageDeposit(
                  historyData.hash,
                  accountId as string
                )
              Object.assign(historyData, {
                status: HistoryStatus.STORAGE_DEPOSIT,
                details: {
                  ...historyData.details,
                  recoverDetails: {
                    ...detailsFromStorageDeposit,
                  },
                },
              })
              break

            case TransactionMethod.NATIVE_ON_TRANSFER:
              getHashedArgs =
                historyData.details.transaction.actions[0].FunctionCall.args
              argsJson = Buffer.from(getHashedArgs ?? "", "base64").toString(
                "utf-8"
              )
              args = JSON.parse(argsJson)
              msgBase64 = (args as { msg: string }).msg
              recoverData = JSON.parse(msgBase64)
              Object.assign(historyData, {
                intentId: (recoverData as NearIntent1CreateSingleChain)?.id,
                details: {
                  ...historyData.details,
                  recoverDetails: {
                    ...(recoverData as NearIntent1CreateSingleChain),
                    receive: {
                      amount: (recoverData as NearIntent1CreateSingleChain)
                        ?.asset_out?.amount,
                    },
                    expiration: (recoverData as NearIntent1CreateSingleChain)
                      .expiration.block_number,
                    receiverId: historyData.details.transaction.receiver_id,
                  },
                },
              })

              getIntent = await callRequestGetIntent(
                historyData.details.transaction.receiver_id,
                historyData.intentId
              )
              if (getIntent?.status) {
                Object.assign(historyData, {
                  status: getIntent.status,
                  proof: getIntent?.proof,
                })
              }
              break
          }
        }

        // Extract data from local or intent
        if (
          !historyData.details?.selectedTokenIn ||
          !historyData.details?.selectedTokenOut ||
          !historyData.details?.tokenIn ||
          !historyData.details?.tokenOut
        ) {
          const getConfirmSwapFromLocal = localStorage.getItem(
            CONFIRM_SWAP_LOCAL_KEY
          )
          if (getConfirmSwapFromLocal) {
            const parsedData: { data: ModalConfirmSwapPayload } = JSON.parse(
              getConfirmSwapFromLocal
            )
            if (parsedData.data.intentId === historyData.intentId) {
              Object.assign(historyData, {
                details: {
                  ...historyData.details,
                  tokenIn: parsedData.data.tokenIn,
                  tokenOut: parsedData.data.tokenOut,
                  selectedTokenIn: parsedData.data.selectedTokenIn,
                  selectedTokenOut: parsedData.data.selectedTokenOut,
                },
              })
            } else if (
              historyData.details?.transaction?.receiver_id &&
              (transactionMethodName === TransactionMethod.FT_TRANSFER_CALL ||
                transactionMethodName === TransactionMethod.NATIVE_ON_TRANSFER)
            ) {
              const detailsFromGetIntent = await getDetailsFromGetIntent(
                historyData?.details.recoverDetails?.receiverId ||
                  historyData.details.transaction.receiver_id,
                historyData.intentId
              )
              Object.assign(historyData, {
                details: {
                  ...historyData.details,
                  ...detailsFromGetIntent,
                },
              })
            }
          }
        }

        const { isFailure } = await getTransactionScan(
          historyData!.details as NearTX
        )
        if (isFailure) {
          historyCompletion.push(true)
          Object.assign(historyData, { status: HistoryStatus.FAILED })
          return historyData
        }

        historyCompletion.push(false)
        return historyData
      })
    )

    updateHistory(result)

    if (!historyCompletion.includes(false)) {
      setIsHistoryWorkerSleeping(true)
      setIsMonitoringComplete({
        ...isMonitoringComplete,
        done: true,
      })
      return
    }

    setTimeout(() => {
      console.log("useHistoryLatest next run: ", isMonitoringComplete.cycle)
      setIsMonitoringComplete({
        ...isMonitoringComplete,
        cycle: isMonitoringComplete.cycle++,
      })
      runHistoryMonitoring(result)
    }, SCHEDULER_5_SEC)
  }

  const runHistoryUpdate = (data: HistoryData[]): void => {
    setIsHistoryWorkerSleeping(false)
    void runHistoryMonitoring(data)
  }

  return {
    runHistoryUpdate,
    isHistoryWorkerSleeping,
    isMonitoringComplete,
  }
}

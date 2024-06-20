"use client"

import React, { useEffect, useState, useId } from "react"
import { Text } from "@radix-ui/themes"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import ModalDialog from "@src/components/Modal/ModalDialog"
import { NetworkToken } from "@src/types/interfaces"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import { CallRequestIntentProps, useSwap } from "@src/hooks/useSwap"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { useCreateQueryString } from "@src/hooks/useQuery"
import { ModalReviewSwapPayload } from "@src/components/Modal/ModalReviewSwap"
import { ModalType } from "@src/stores/modalStore"
import { sha256 } from "@src/actions/crypto"

export interface ModalConfirmSwapPayload extends CallRequestIntentProps {}

const CONFIRM_SWAP_LOCAL_KEY = "__d_confirm_swap"

const ModalConfirmSwap = () => {
  const [transactionQueue, setTransactionQueue] = useState(0)
  const [dataFromLocal, setDataFromLocal] = useState<ModalConfirmSwapPayload>()
  const clientId = useId()
  const { selector, accountId } = useWalletSelector()
  const { callRequestCreateIntent, getEstimateQueueTransactions } = useSwap({
    selector,
    accountId,
  })
  const router = useRouter()
  const pathname = usePathname()
  const { createQueryString } = useCreateQueryString()
  const { onCloseModal, modalType, payload } = useModalStore((state) => state)
  const modalPayload = payload as ModalReviewSwapPayload

  const getSwapFromLocal = (): ModalConfirmSwapPayload | null => {
    const getConfirmSwapFromLocal = localStorage.getItem(CONFIRM_SWAP_LOCAL_KEY)
    if (!getConfirmSwapFromLocal) return null
    const parsedData: { data: ModalConfirmSwapPayload } = JSON.parse(
      getConfirmSwapFromLocal
    )
    return parsedData.data
  }

  // Storing data for recovering progress of transaction track
  const setSwapToLocal = (inputs: ModalConfirmSwapPayload) => {
    localStorage.setItem(
      CONFIRM_SWAP_LOCAL_KEY,
      JSON.stringify({ data: inputs })
    )
  }

  const handleBatchCreateSwapQuery = ({
    defuseClientId,
  }: {
    defuseClientId: string
  }) => {
    const buildSwapQuery = [
      ["modalType", ModalType.MODAL_CONFIRM_SWAP],
      ["defuseClientId", defuseClientId],
    ]
      .map(([key, value]) => createQueryString(key, value))
      .join("&")
    router.replace(pathname + "?" + buildSwapQuery)
  }

  const handleEstimateQueueTransactions = async () => {
    const queueTransactions = await getEstimateQueueTransactions({
      tokenIn: modalPayload.tokenIn,
      tokenOut: modalPayload.tokenOut,
      selectedTokenIn: modalPayload.selectedTokenIn,
      selectedTokenOut: modalPayload.selectedTokenOut,
    })
    setTransactionQueue(queueTransactions)
  }

  const handleValidateNextQueueTransaction = (
    inputs: ModalConfirmSwapPayload
  ) => {
    // Stop cycle if the last transaction is caught by defuseClientId in history
    console.log("handleValidateNextQueueTransaction: ", inputs)
  }

  const handleTrackSwap = async () => {
    if (!modalPayload) {
      const data = getSwapFromLocal()
      console.log("Recreate stored call data: ", data)
      if (data) {
        setDataFromLocal(data)

        const inputs = {
          tokenIn: data!.tokenIn,
          tokenOut: data!.tokenOut,
          selectedTokenIn: data!.selectedTokenIn,
          selectedTokenOut: data!.selectedTokenOut,
          defuseClientId: data.defuseClientId,
        }

        handleValidateNextQueueTransaction(inputs)

        setSwapToLocal(inputs)
        handleBatchCreateSwapQuery({
          defuseClientId: data.defuseClientId as string,
        })
        await callRequestCreateIntent(inputs)
      }
      return
    }

    const newDefuseClientId = await sha256(clientId as string)
    await handleEstimateQueueTransactions()

    const inputs = {
      tokenIn: modalPayload.tokenIn,
      tokenOut: modalPayload.tokenOut,
      selectedTokenIn: modalPayload.selectedTokenIn,
      selectedTokenOut: modalPayload.selectedTokenOut,
      defuseClientId: newDefuseClientId,
    }

    handleValidateNextQueueTransaction(inputs)

    setSwapToLocal(inputs)
    handleBatchCreateSwapQuery({
      defuseClientId: newDefuseClientId,
    })
    await callRequestCreateIntent(inputs)
  }

  useEffect(() => {
    handleTrackSwap()
  }, [])

  return (
    <ModalDialog>
      <div className="flex flex-col min-h-[256px] max-h-[680px] h-full p-5">
        <div className="relative flex justify-between items-start mb-[44px]">
          <div className="w-full shrink absolute relative top-[30px] left-[50%] -translate-x-2/4 flex justify-center items-center">
            <div className="relative w-[56px] h-[56px]">
              <Image
                src="/static/icons/Wallet.svg"
                alt="Wallet Icon"
                width={56}
                height={56}
              />
              <div className="absolute -top-[6px] -right-[10px] w-[20px] h-[20px] flex justify-center items-center rounded-full bg-primary">
                <Text size="2" weight="medium" className="text-white">
                  {transactionQueue}
                </Text>
              </div>
            </div>
          </div>
          <button
            className="shrink-0 w-[40px] h-[40px] flex justify-center items-center"
            onClick={onCloseModal}
          >
            <Image
              src="/static/icons/close.svg"
              alt="Close Icon"
              width={14}
              height={14}
            />
          </button>
        </div>
        <div className="w-full flex flex-col text-center text-black-400 gap-1 mb-4">
          <Text size="4" weight="bold">
            Confirm swap
          </Text>
          <Text size="2" weight="bold" className="text-gray-600">
            Please confirm transaction in your wallet.
          </Text>
        </div>
        <div className="flex justify-center">
          <div className="flex justify-center items-center gap-1 px-2.5 py-1 bg-gray-950 rounded-full">
            <Text size="2" weight="medium" className="text-black-400">
              {`${modalPayload?.tokenIn || dataFromLocal?.tokenIn || ""} ${modalPayload?.selectedTokenIn?.symbol || dataFromLocal?.selectedTokenIn?.symbol || ""}`}
            </Text>
            <Image
              src="/static/icons/arrow-right.svg"
              alt="Arrow Icon"
              width={24}
              height={24}
            />
            <Text size="2" weight="medium" className="text-black-400">
              {`${modalPayload?.tokenOut || dataFromLocal?.tokenOut || ""} ${modalPayload?.selectedTokenOut?.symbol || dataFromLocal?.selectedTokenOut?.symbol || ""}`}
            </Text>
          </div>
        </div>
      </div>
    </ModalDialog>
  )
}

export default ModalConfirmSwap

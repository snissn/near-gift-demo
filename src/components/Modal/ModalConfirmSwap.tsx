"use client"

import React, { useEffect, useState } from "react"
import { Text } from "@radix-ui/themes"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import ModalDialog from "@src/components/Modal/ModalDialog"
import { NetworkToken } from "@src/types/interfaces"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import { useSwap } from "@src/hooks/useSwap"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { useCreateQueryString } from "@src/hooks/useCreateQueryString"
import { ModalReviewSwapPayload } from "@src/components/Modal/ModalReviewSwap"

export type ModalConfirmSwapPayload = {
  tokenIn: number
  tokenOut: number
  selectedTokenIn: NetworkToken
  selectedTokenOut: NetworkToken
}

const CONFIRM_SWAP_LOCAL_KEY = "__d_confirm_swap"

const ModalConfirmSwap = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [dataFromLocal, setDataFromLocal] = useState<ModalConfirmSwapPayload>()
  const { createQueryString } = useCreateQueryString()
  const { onCloseModal, modalType, payload } = useModalStore((state) => state)
  const modalPayload = payload as ModalReviewSwapPayload

  const getSwapFromLocal = () => {
    if (!modalPayload) {
      const getConfirmSwapFromLocal = localStorage.getItem(
        CONFIRM_SWAP_LOCAL_KEY
      )
      getConfirmSwapFromLocal &&
        setDataFromLocal(JSON.parse(getConfirmSwapFromLocal))
      return
    }
    localStorage.setItem(CONFIRM_SWAP_LOCAL_KEY, JSON.stringify(modalPayload))
  }

  useEffect(() => {
    const buildQuery = createQueryString("modalType", "modalConfirmSwap")
    router.replace(pathname + "?" + buildQuery)
    getSwapFromLocal()
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
                  1
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

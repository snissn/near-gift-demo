"use client"

import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Button, Text, Tooltip } from "@radix-ui/themes"
import Image from "next/image"
import React, { useState } from "react"

import ModalDialog from "@src/components/Modal/ModalDialog"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useModalStore } from "@src/providers/ModalStoreProvider"

const ModalSelectWallet = () => {
  const { onCloseModal, payload } = useModalStore((state) => state)
  const { handleSignIn } = useConnectWallet()

  const handleNearWalletSelector = () => {
    handleSignIn()
    onCloseModal()
  }

  const handleWalletConnect = () => {
    console.log("handleWalletConnect")
  }

  return (
    <ModalDialog>
      <div className="flex flex-col min-h-[256px] max-h-[680px] h-full p-5">
        <div className="flex justify-between items-center mb-[44px]">
          <div className="relative w-full shrink text-center text-black-400">
            <Text size="4" weight="bold" className="dark:text-gray-500">
              Connect wallet
            </Text>
          </div>
          <button type={"button"} className="shrink-0" onClick={onCloseModal}>
            <Image
              src="/static/icons/close.svg"
              alt="Close Icon"
              width={14}
              height={14}
            />
          </button>
        </div>
        <div className="w-full grid grid-cols-2 gap-4">
          <Button
            onClick={handleNearWalletSelector}
            size="4"
            radius="medium"
            variant="soft"
            color="gray"
          >
            <Image
              src="/static/icons/network/near_dark.svg"
              alt="Near Wallet Selector"
              width={14}
              height={14}
            />
            <Text size="2" weight="bold">
              Near Wallet Selector
            </Text>
          </Button>
          <Button
            onClick={handleWalletConnect}
            size="4"
            radius="medium"
            variant="soft"
            color="gray"
          >
            <Image
              src="/static/icons/wallet-connect-v2.svg"
              alt="Wallet Connect"
              width={24}
              height={24}
            />
            <Text size="2" weight="bold">
              Wallet Connect
            </Text>
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}

export default ModalSelectWallet

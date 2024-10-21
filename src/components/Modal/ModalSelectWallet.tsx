"use client"

import { Button, Text } from "@radix-ui/themes"
import Image from "next/image"
import React from "react"

import ModalDialog from "@src/components/Modal/ModalDialog"
import { SignInType, useConnectWallet } from "@src/hooks/useConnectWallet"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import type { Connector } from "wagmi"

const ModalSelectWallet = () => {
  const { onCloseModal } = useModalStore((state) => state)
  const { signIn, connectors } = useConnectWallet()

  const handleNearWalletSelector = () => {
    signIn({ id: SignInType.NearWalletSelector, params: undefined })
    onCloseModal()
  }

  const handleWalletConnect = (connector: Connector) => {
    signIn({ id: SignInType.WalletConnect, params: { connector } })
    onCloseModal()
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
            key={connectors[0].id}
            onClick={() => handleWalletConnect(connectors[0])}
            size="4"
            radius="medium"
            variant="soft"
            color="gray"
          >
            <Image
              src="/static/icons/logo-meta-mask.svg"
              alt="Wallet Connect"
              width={24}
              height={24}
            />
            <Text size="2" weight="bold">
              MetaMask
            </Text>
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}

export default ModalSelectWallet

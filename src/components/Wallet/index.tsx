"use client"

import { CountdownTimerIcon } from "@radix-ui/react-icons"
import { Button, Popover, Text } from "@radix-ui/themes"
import clsx from "clsx"
import Image from "next/image"
import React from "react"

import WalletConnections from "@src/components/Wallet/WalletConnections"
import WalletTabs from "@src/components/Wallet/WalletTabs"
import { SignInType, useConnectWallet } from "@src/hooks/useConnectWallet"
import useShortAccountId from "@src/hooks/useShortAccountId"
import { useHistoryStore } from "@src/providers/HistoryStoreProvider"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import { ModalType } from "@src/stores/modalStore"
import type { Connector } from "wagmi"

const TURN_OFF_APPS = process?.env?.turnOffApps === "true" ?? true
const TURN_OFF_EVM_WALLETS = process?.env?.turnOffEvmWallets === "true" ?? true

const ConnectWallet = () => {
  const { state } = useConnectWallet()
  const { shortAccountId } = useShortAccountId(state.address ?? "")
  const { openWidget } = useHistoryStore((state) => state)
  const { signIn, connectors } = useConnectWallet()

  const handleNearWalletSelector = () => {
    signIn({ id: SignInType.NearWalletSelector })
  }

  const handleWalletConnect = (connector: Connector) => {
    signIn({ id: SignInType.Wagmi, connector })
  }

  const handleTradeHistory = () => openWidget()

  if (!state.address || TURN_OFF_APPS) {
    return (
      <Popover.Root>
        <Popover.Trigger>
          <button
            type={"button"}
            className={clsx(
              "rounded-full text-white px-4 py-2.5 text-sm",
              TURN_OFF_APPS ? "bg-gray-500" : "bg-primary"
            )}
            disabled={TURN_OFF_APPS}
          >
            <Text size="2" weight="medium" wrap="nowrap">
              Connect wallet
            </Text>
          </button>
        </Popover.Trigger>
        <Popover.Content className="min-w-[330px] md:mr-[48px] dark:bg-black-800 rounded-2xl">
          <Text size="1">How do you want to connect?</Text>
          <div className="w-full grid grid-cols-1 gap-4 mt-4">
            <Button
              onClick={handleNearWalletSelector}
              size="4"
              radius="medium"
              variant="soft"
              color="gray"
              className="px-2.5"
            >
              <div className="w-full flex items-center justify-start gap-2">
                <Image
                  src="/static/icons/wallets/near-wallet-selector.svg"
                  alt="Near Wallet Selector"
                  width={36}
                  height={36}
                />
                <Text size="2" weight="bold">
                  NEAR wallet Selector
                </Text>
              </div>
            </Button>
            {!TURN_OFF_EVM_WALLETS && (
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
            )}
          </div>
        </Popover.Content>
      </Popover.Root>
    )
  }

  return (
    <div className="flex gap-2">
      <Popover.Root>
        <Popover.Trigger>
          <button
            type={"button"}
            className="rounded-full bg-gray-200 text-black-400 text-sm px-3 py-1.5 dark:bg-gray-1000 dark:text-gray-100"
            disabled={TURN_OFF_APPS}
          >
            {shortAccountId}
          </button>
        </Popover.Trigger>
        <Popover.Content className="min-w-[330px] mt-1 md:mr-[48px] dark:bg-black-800 rounded-2xl">
          <div className="flex flex-col gap-5">
            <WalletTabs />
            <WalletConnections />
            <Button
              onClick={handleTradeHistory}
              size="2"
              variant="soft"
              radius="full"
              color="gray"
              className="w-full text-black dark:text-white cursor-pointer"
            >
              <CountdownTimerIcon width={16} height={16} />
              <Text size="2" weight="medium">
                Transactions
              </Text>
            </Button>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

export default ConnectWallet

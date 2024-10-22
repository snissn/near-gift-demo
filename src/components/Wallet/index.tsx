"use client"

import { CountdownTimerIcon } from "@radix-ui/react-icons"
import { Button, Popover, Text } from "@radix-ui/themes"
import clsx from "clsx"
import React from "react"

import WalletConnections from "@src/components/Wallet/WalletConnections"
import WalletTabs from "@src/components/Wallet/WalletTabs"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import useShortAccountId from "@src/hooks/useShortAccountId"
import { useHistoryStore } from "@src/providers/HistoryStoreProvider"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import { ModalType } from "@src/stores/modalStore"

const TURN_OFF_APPS = process?.env?.turnOffApps === "true" ?? true

const ConnectWallet = () => {
  const { state } = useConnectWallet()
  const { shortAccountId } = useShortAccountId(state.address ?? "")
  const { openWidget } = useHistoryStore((state) => state)
  const { setModalType } = useModalStore((state) => state)

  const handleTradeHistory = () => openWidget()

  const handleSelectWallet = () => {
    setModalType(ModalType.MODAL_SELECT_WALLET)
  }

  if (!state.address || TURN_OFF_APPS) {
    return (
      <button
        type={"button"}
        onClick={handleSelectWallet}
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

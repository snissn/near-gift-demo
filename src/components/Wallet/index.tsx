"use client"

import React, { useState, useEffect } from "react"
import { Button, Popover, Spinner, Switch, Text } from "@radix-ui/themes"
import clsx from "clsx"
import { CountdownTimerIcon } from "@radix-ui/react-icons"

import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import type { Account } from "@src/types/interfaces"
import { useGetAccount } from "@src/hooks/useGetAccount"
import useShortAccountId from "@src/hooks/useShortAccountId"
import WalletTabs from "@src/components/Wallet/WalletTabs"
import { useHistoryStore } from "@src/providers/HistoryStoreProvider"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import WalletConnections from "@src/components/Wallet/WalletConnections"

const TURN_OFF_APPS = process?.env?.turnOffApps === "true" ?? true

const ConnectWallet = () => {
  const { selector, accountId } = useWalletSelector()
  const { getAccount } = useGetAccount({ accountId, selector })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [account, setAccount] = useState<Account | null>(null)
  const { shortAccountId } = useShortAccountId(accountId as string)
  const { openWidget } = useHistoryStore((state) => state)
  const { handleSignIn, handleSignOut } = useConnectWallet()

  useEffect(() => {
    if (!accountId) {
      return setAccount(null)
    }

    setIsLoading(true)

    getAccount().then((nextAccount) => {
      setAccount(nextAccount)
      setIsLoading(false)
    })
  }, [accountId, getAccount])

  const handleTradeHistory = () => openWidget()

  if (!account || TURN_OFF_APPS || isLoading) {
    return isLoading ? (
      <Spinner loading={isLoading} />
    ) : (
      <button
        onClick={handleSignIn}
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

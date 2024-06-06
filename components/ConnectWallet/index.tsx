"use client"

import { useState, useEffect } from "react"
import { Popover, Switch } from "@radix-ui/themes"
import { useTheme } from "next-themes"

import { useWalletSelector } from "@/providers/WalletSelectorProvider"
import type { Account } from "@/types/interfaces"
import { useGetAccount } from "@/hooks/useGetAccount"
import Themes from "@/types/themes"

const ConnectWallet = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector()
  const { getAccount } = useGetAccount({ accountId, selector })
  const [loading, setLoading] = useState<boolean>(false)
  const [account, setAccount] = useState<Account | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => setTheme(Themes.LIGHT), [])

  const onChangeTheme = () => {
    setTheme(theme === Themes.DARK ? Themes.LIGHT : Themes.DARK)
  }

  useEffect(() => {
    if (!accountId) {
      return setAccount(null)
    }

    setLoading(true)

    getAccount().then((nextAccount) => {
      setAccount(nextAccount)
      setLoading(false)
    })
  }, [accountId, getAccount])

  const handleSignIn = () => {
    modal.show()
  }

  const handleSignOut = async () => {
    const wallet = await selector.wallet()

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out")
      console.error(err)
    })
  }

  const handleSwitchWallet = () => {
    modal.show()
  }

  const handleSwitchAccount = () => {
    const currentIndex = accounts.findIndex((x) => x.accountId === accountId)
    const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0

    const nextAccountId = accounts[nextIndex].accountId

    selector.setActiveAccount(nextAccountId)

    alert("Switched account to " + nextAccountId)
  }

  const handleTradeHistory = () => console.log("handleTradeHistory")
  const handleCopyAddress = () => console.log("handleCopyAddress")

  if (!account) {
    return (
      <button
        onClick={handleSignIn}
        className="rounded-full bg-blue-300 text-white px-4 py-2.5 text-sm"
      >
        Connect wallet
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <Popover.Root>
        <Popover.Trigger>
          <button className="rounded-full bg-gray-200 text-black-400 text-sm px-3 py-1.5">
            {accountId}
          </button>
        </Popover.Trigger>
        <Popover.Content className="mt-1">
          <div className="flex flex-col items-start">
            <div
              onClick={onChangeTheme}
              className="flex justify-between items-center gap-1"
            >
              <span>Dark Mode</span>
              <Switch
                className="cursor-pointer"
                size="1"
                onClick={onChangeTheme}
              />
            </div>
            <button onClick={handleTradeHistory}>Trade history</button>
            <button onClick={handleCopyAddress}>Copy address</button>
            <button onClick={handleSignOut}>Disconnect wallet</button>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

export default ConnectWallet

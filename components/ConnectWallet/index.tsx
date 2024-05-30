"use client"

import { useState, useEffect } from "react"

import { useWalletSelector } from "@/providers/WalletSelectorProvider"
import type { Account } from "@/types/interfaces"
import { useGetAccount } from "@/hooks/useGetAccount"

const ConnectWallet = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector()
  const { getAccount } = useGetAccount({ accountId, selector })
  const [loading, setLoading] = useState<boolean>(false)
  const [account, setAccount] = useState<Account | null>(null)

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
      <button className="rounded-full bg-gray-200 text-black-400 text-sm px-3 py-1.5">
        {accountId}
      </button>
      {/* TODO Update wallet flows after design complete */}
      {/*<button onClick={handleSignOut}>Log out</button>*/}
      {/*<button onClick={handleSwitchWallet}>Switch Wallet</button>*/}
      {/*{accounts.length > 1 && (*/}
      {/*  <button onClick={handleSwitchAccount}>Switch Account</button>*/}
      {/*)}*/}
    </div>
  )
}

export default ConnectWallet

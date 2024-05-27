"use client"

import { useState, useCallback, useEffect } from "react"
import { providers } from "near-api-js"
import BN from "bn.js"
import type { AccountView } from "near-api-js/lib/providers/provider"

import { useWalletSelector } from "@/providers/WalletSelectorProvider"
import type { Account, Message } from "@/types/interfaces"

interface GetAccountBalanceProps {
  provider: providers.Provider
  accountId: string
}

const getAccountBalance = async ({
  provider,
  accountId,
}: GetAccountBalanceProps) => {
  try {
    const { amount } = await provider.query<AccountView>({
      request_type: "view_account",
      finality: "final",
      account_id: accountId,
    })
    const bn = new BN(amount)
    return { hasBalance: !bn.isZero() }
  } catch {
    return { hasBalance: false }
  }
}

const ConnectWallet = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const getAccount = useCallback(async (): Promise<Account | null> => {
    if (!accountId) {
      return null
    }

    const { network } = selector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    const { hasBalance } = await getAccountBalance({
      provider,
      accountId,
    })

    if (!hasBalance) {
      window.alert(
        `Account ID: ${accountId} has not been founded. Please send some NEAR into this account.`
      )
      const wallet = await selector.wallet()
      await wallet.signOut()
      return null
    }

    return provider
      .query<AccountView>({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      })
      .then((data) => ({
        ...data,
        account_id: accountId,
      }))
  }, [accountId, selector])

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
      <button onClick={handleSignOut}>Log out</button>
      <button onClick={handleSwitchWallet}>Switch Wallet</button>
      {accounts.length > 1 && (
        <button onClick={handleSwitchAccount}>Switch Account</button>
      )}
    </div>
  )
}

export default ConnectWallet

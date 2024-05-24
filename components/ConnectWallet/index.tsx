"use client"

import { useRouter } from "next/navigation"

import { Navigation } from "@/constants/routes"

const ConnectWallet = () => {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(Navigation.WALLET)}
      className="rounded-full bg-blue-300 text-white px-4 py-2.5 text-sm"
    >
      Connect wallet
    </button>
  )
}

export default ConnectWallet

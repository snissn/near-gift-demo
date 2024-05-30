"use client"

import { useRouter } from "next/navigation"

import { Navigation } from "@/constants/routes"

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col flex-1 justify-center item-center">
      <div className="w-full mx-auto max-w-md flex flex-col items-center gap-6">
        <h1 className="text-4xl text-center font-bold">
          Get started with Defuse landing page
        </h1>
        <button
          onClick={() => router.push(Navigation.SWAP)}
          className="rounded-full bg-black text-white px-[35.5px] py-[15px] text-lg"
        >
          Get started
        </button>
      </div>
    </div>
  )
}

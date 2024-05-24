"use client"

import React from "react"

import CardBalance from "@/app/wallet/CardBalance"

export default function Wallet() {
  return (
    <div className="flex flex-col flex-1">
      <div className="w-full mx-auto max-w-[768px] mt-[64px] mb-[90px]">
        <h1 className="mb-8">Wallet</h1>
      </div>
      <div className="w-full mx-auto max-w-7xl grid grid-cols-2 gap-10">
        <div className="flex flex-col">
          <CardBalance chainIds={[1313161554]} />
        </div>
        <div className="flex flex-col">
          <CardBalance chainIds={[8453]} />
        </div>
      </div>
    </div>
  )
}

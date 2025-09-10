"use client"

import { injected } from "@wagmi/core"
import { createConfig, http } from "wagmi"
import { mainnet } from "wagmi/chains"

export const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
})


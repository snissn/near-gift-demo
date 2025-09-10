"use client"

import { PROJECT_ID } from "@src/utils/environment"
import { injected } from "@wagmi/core"
import { http, createConfig } from "wagmi"
import { mainnet } from "wagmi/chains"
import { coinbaseWallet, walletConnect } from "wagmi/connectors"

export const config = createConfig({
  chains: [mainnet],
  connectors: [
    // WalletConnect (if project id present)
    PROJECT_ID != null &&
      walletConnect({
        projectId: PROJECT_ID,
        showQrModal: true,
        customStoragePrefix: "near-intents",
      }),
    // Coinbase
    coinbaseWallet({ appName: "Near Intents" }),
    // Injected (MetaMask etc.)
    injected(),
  ].filter((a): a is Exclude<typeof a, boolean> => !!a),
  transports: {
    [mainnet.id]: http(),
  },
})

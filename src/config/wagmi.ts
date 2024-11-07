import { http, createConfig } from "wagmi"
import { arbitrum, base, mainnet } from "wagmi/chains"
import {
  coinbaseWallet,
  injected,
  metaMask,
  walletConnect,
} from "wagmi/connectors"

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ""

export const config = createConfig({
  chains: [mainnet, base, arbitrum],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: PROJECT_ID,
      showQrModal: true,
    }),
    coinbaseWallet({ appName: "Defuse" }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
})

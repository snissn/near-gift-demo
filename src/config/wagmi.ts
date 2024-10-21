import { http, createConfig } from "wagmi"
import { arbitrum, base, mainnet } from "wagmi/chains"
import { metaMask } from "wagmi/connectors"

export const config = createConfig({
  chains: [mainnet, base, arbitrum],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "Defuse Protocol",
        url: "https://defuse.org/",
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
})

import type React from "react"
import type { PropsWithChildren } from "react"
import type { Metadata } from "next"

import Layout from "@src/components/Layout"

export const metadata: Metadata = {
  title: "Wallet",
  description: "Wallet",
}

const WalletLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default WalletLayout

import type { Metadata } from "next"
import type React from "react"
import type { PropsWithChildren } from "react"

import Layout from "@src/components/Layout"

export const metadata: Metadata = {
  title: "Manage Your Digital Wallet - Secure and Easy Access",
  description:
    "Access and manage your digital wallet with ease. Secure transactions, balance tracking, and more. Start managing your finances today.",
}

const WalletLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default WalletLayout

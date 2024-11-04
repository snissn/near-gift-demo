import type { Metadata } from "next"
import type React from "react"
import type { PropsWithChildren } from "react"

import Layout from "@src/components/Layout"

export const metadata: Metadata = {
  title: "Deposit | Your Multichain DeFi Hub",
  description:
    "Seamlessly manage your cross-chain deposits with our efficient DeFi hub. Join us to experience unparalleled ease and security.",
}

const DepositLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default DepositLayout

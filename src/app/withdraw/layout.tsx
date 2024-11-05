import type { Metadata } from "next"
import type React from "react"
import type { PropsWithChildren } from "react"

import Layout from "@src/components/Layout"

export const metadata: Metadata = {
  title: "Withdraw - Your Trusted Financial Partner",
  description:
    "Easily manage your withdrawals with our secure and user-friendly platform. Experience seamless transactions and exceptional support.",
}

const WithdrawLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default WithdrawLayout

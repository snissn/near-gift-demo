import type { Metadata } from "next"
import type React from "react"
import type { PropsWithChildren } from "react"

import Layout from "@src/components/Layout"

export const metadata: Metadata = {
  title: "Deposit",
  description: "Deposit",
}

const DepositLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default DepositLayout

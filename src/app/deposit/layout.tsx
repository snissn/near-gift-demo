import React, { PropsWithChildren } from "react"
import { Metadata } from "next"

import Layout from "@src/components/Layout"

export const metadata: Metadata = {
  title: "Deposit",
  description: "Deposit",
}

const DepositLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default DepositLayout

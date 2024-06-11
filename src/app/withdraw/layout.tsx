import React, { PropsWithChildren } from "react"
import { Metadata } from "next"

import Layout from "@src/components/Layout"

export const metadata: Metadata = {
  title: "Withdraw",
  description: "Withdraw",
}

const WithdrawLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default WithdrawLayout

import React, { PropsWithChildren } from "react"
import { Metadata } from "next"

import Layout from "@/components/Layout"

export const metadata: Metadata = {
  title: "Home",
  description: "Home",
}

const HomeLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default HomeLayout

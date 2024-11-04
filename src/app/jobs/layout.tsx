import type { Metadata } from "next"
import type React from "react"
import type { PropsWithChildren } from "react"

import Layout from "@src/components/Layout"

export const metadata: Metadata = {
  title: "Careers - Join Our Team",
  description:
    "Join for exciting careers in blockchain and cross-chain technology. Apply today and start shaping the future of decentralized finance!",
}

const JobsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export default JobsLayout

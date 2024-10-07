"use client"

import { usePathname } from "next/navigation"
import type React from "react"
import type { PropsWithChildren } from "react"

import { useInterceptors } from "@src/api/api"
import History from "@src/components/History"
import HistoryLastUpdate from "@src/components/History/HistoryLastUpdate"
import Footer from "@src/components/Layout/Footer"
import Header from "@src/components/Layout/Header"
import NavbarMobile from "@src/components/NavbarMobile"
import PageBackground from "@src/components/PageBackground"
import Snackbar from "@src/components/Snackbar"
import { LINKS_HEADER } from "@src/constants/routes"
import { withHistory } from "@src/hocs/withHistory"
import { withTokensBalance } from "@src/hocs/withTokensBalance"

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  useInterceptors()
  const pathname = usePathname()
  const isAppsPath = LINKS_HEADER.some((route) => route.href === pathname)

  // PREFETCH: Prefetch action could be done similarly to the prefetch action
  //           in _app.ts within the pages Router.
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex md:flex-1">{children}</main>
      <Footer />
      <NavbarMobile />
      <PageBackground />
      {isAppsPath && <History />}
      <HistoryLastUpdate />
      <Snackbar />
    </div>
  )
}

export default withTokensBalance(withHistory(Layout))

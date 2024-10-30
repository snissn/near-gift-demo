"use client"

import type React from "react"
import type { PropsWithChildren } from "react"

import { useInterceptors } from "@src/api/api"
import Footer from "@src/components/Layout/Footer"
import Header from "@src/components/Layout/Header"
import NavbarMobile from "@src/components/NavbarMobile"
import PageBackground from "@src/components/PageBackground"
import Snackbar from "@src/components/Snackbar"

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  useInterceptors()

  // PREFETCH: Prefetch action could be done similarly to the prefetch action
  //           in _app.ts within the pages Router.
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex md:flex-1">{children}</main>
      <Footer />
      <NavbarMobile />
      <PageBackground />
      <Snackbar />
    </div>
  )
}

export default Layout

import React, { PropsWithChildren } from "react"

import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/Footer"
import PageBackground from "@/components/PageBackground"
import NavbarMobile from "@/components/NavbarMobile"

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  // PREFETCH: Prefetch action could be done similarly to the prefetch action
  //           in _app.ts within the pages Router.
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex md:flex-1">{children}</main>
      <Footer />
      <NavbarMobile />
      <PageBackground />
    </div>
  )
}

export default Layout

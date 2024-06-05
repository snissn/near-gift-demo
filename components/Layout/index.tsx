import React, { PropsWithChildren } from "react"

import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/Footer"
import PageBackground from "@/components/PageBackground"

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  // PREFETCH: Prefetch action could be done similarly to the prefetch action
  //           in _app.ts within the pages Router.
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1">{children}</main>
      <Footer />
      <PageBackground />
    </div>
  )
}

export default Layout

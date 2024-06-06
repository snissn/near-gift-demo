"use client"

import React from "react"

import Navbar from "@/components/Navbar"
import { LINKS_HEADER } from "@/constants/routes"

const NavbarMobile = () => {
  const handleOpenHistory = () => console.log("handleOpenHistory")
  const historyActionLink = { action: handleOpenHistory, label: "History" }
  return (
    <>
      <div className="fixed bottom-0 left-0 md:hidden w-full px-5 py-3 bg-white border-t-[1px] border-white-200">
        <Navbar links={[...LINKS_HEADER, historyActionLink]} />
      </div>
      <div className="block md:hidden h-[56px]"></div>
    </>
  )
}

export default NavbarMobile

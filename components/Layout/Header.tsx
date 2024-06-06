"use client"

import Logo from "@/components/Logo"
import Navbar from "@/components/Navbar"
import ConnectWallet from "@/components/ConnectWallet"
import Settings from "@/components/Settings"

const Header = () => {
  return (
    <>
      <header className="fixed top-0 left-0 w-full md:relative border-b-[1px] border-white-200 z-10 bg-gray dark:bg-black">
        <div className="flex justify-between items-center p-3">
          <Logo />
          <div className="hidden md:flex justify-center w-full max-w-5xl pl-3">
            <Navbar />
          </div>
          <div className="flex justify-between items-center gap-2.5">
            <ConnectWallet />
            <Settings />
          </div>
        </div>
      </header>
      <div className="block md:hidden h-[56px]"></div>
    </>
  )
}

export default Header

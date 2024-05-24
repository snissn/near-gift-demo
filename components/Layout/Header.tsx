"use client"

import { useTheme } from "next-themes"
import { Switch } from "@radix-ui/themes"

import Logo from "@/components/Logo"
import Navbar from "@/components/Navbar"
import ConnectWallet from "@/components/ConnectWallet"
import Settings from "@/components/Settings"
import Themes from "@/types/themes"

const Header = () => {
  const { theme, setTheme } = useTheme()

  const onChangeTheme = () => {
    setTheme(theme === Themes.DARK ? Themes.LIGHT : Themes.DARK)
  }

  return (
    <header className="relative border-b-[1px] border-black">
      <div className="w-full mx-auto max-w-7xl px-4 py-[1rem] flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1">
          <span>Dark Mode</span>
          <Switch className="cursor-pointer" size="1" onClick={onChangeTheme} />
        </div>
        <Navbar />
        <div className="flex justify-between items-center gap-2.5">
          <ConnectWallet />
          <Settings />
        </div>
      </div>
    </header>
  )
}

export default Header

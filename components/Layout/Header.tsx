import Logo from "@/components/Logo"
import Navbar from "@/components/Navbar"
import ConnectWallet from "@/components/ConnectWallet"
import Settings from "@/components/Settings"

const Header = () => {
  return (
    <header className="relative border-b-[1px] border-black">
      <div className="w-full mx-auto max-w-7xl px-4 py-[1rem] flex items-center justify-between">
        <Logo />
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

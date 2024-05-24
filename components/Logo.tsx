import Link from "next/link"

import { Navigation } from "@/constants/routes"

const Logo = () => {
  return (
    <Link
      href={Navigation.HOME}
      className="px-3 py-1 bg-gray-200 rounded-lg uppercase font-bold text-xl"
    >
      Defuse
    </Link>
  )
}

export default Logo

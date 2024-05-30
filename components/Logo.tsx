import Link from "next/link"
import Image from "next/image"

import { Navigation } from "@/constants/routes"

const Logo = () => {
  return (
    <Link href={Navigation.HOME} className="block w-[123px] h-[32px]">
      <Image src="/static/icons/Logo.svg" alt="Defuse Logo" fill />
    </Link>
  )
}

export default Logo

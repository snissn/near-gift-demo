import Link from "next/link"
import Image from "next/image"

import { Navigation } from "@src/constants/routes"

const Logo = () => {
  return (
    <Link href={Navigation.HOME}>
      <Image
        src="/static/icons/Logo.svg"
        alt="Defuse Logo"
        width={123}
        height={32}
      />
    </Link>
  )
}

export default Logo

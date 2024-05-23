import Link from "next/link"

const Logo = () => {
  return (
    <Link
      href={process.env.NEXT_PUBLIC_VERCEL_URL || "/"}
      className="px-3 py-1 bg-gray-200 rounded-lg uppercase font-bold text-xl"
    >
      Defuse
    </Link>
  )
}

export default Logo

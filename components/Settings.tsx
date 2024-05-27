"use client"

import { useRouter } from "next/navigation"

import { Navigation } from "@/constants/routes"

const Settings = () => {
  const router = useRouter()

  const elementCircleStyle = "bg-black w-[3px] h-[3px] rounded-full"
  return (
    <button
      onClick={() => router.push(Navigation.WALLET)}
      className="w-[35px] h-[35px] flex justify-center items-center bg-gray-200 rounded-full gap-1"
    >
      <span className={elementCircleStyle}></span>
      <span className={elementCircleStyle}></span>
      <span className={elementCircleStyle}></span>
    </button>
  )
}

export default Settings

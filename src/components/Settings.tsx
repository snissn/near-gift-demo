"use client"

import { useRouter } from "next/navigation"

import { Navigation } from "@src/constants/routes"

const TURN_OFF_APPS = process?.env?.turnOffApps === "true" ?? true

const Settings = () => {
  const router = useRouter()

  const elementCircleStyle = "bg-black w-[3px] h-[3px] rounded-full"
  return (
    <button
      onClick={() => router.push(Navigation.WALLET)}
      className="w-[32px] h-[32px] flex justify-center items-center bg-gray-200 rounded-full gap-1"
      disabled={TURN_OFF_APPS}
    >
      <span className={elementCircleStyle}></span>
      <span className={elementCircleStyle}></span>
      <span className={elementCircleStyle}></span>
    </button>
  )
}

export default Settings

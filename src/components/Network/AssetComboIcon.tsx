import Image from "next/image"

import type { NetworkToken } from "@src/types/interfaces"

const AssetComboIcon = ({
  icon,
  name,
  chainIcon,
  chainName,
}: Omit<Partial<NetworkToken>, "balance" | "balanceUsd">) => {
  return (
    <div className="relative inline-block">
      <div className="relative overflow-hidden w-[36px] h-[36px] flex justify-center items-center border border-silver-100 rounded-full">
        <Image
          src={icon ?? "/static/icons/fallback-img.svg"}
          alt={name || "Coin Logo"}
          fill
          style={{
            objectFit: "contain",
          }}
          priority
        />
      </div>
      <div className="absolute bottom-0 -right-[7px] flex justify-center items-center p-[3px] bg-black-300 rounded-full border border-white dark:border-black-950 w-[18px] h-[18px]">
        <div className="relative w-[16px] h-[16px]">
          <Image
            src={chainIcon ?? "/static/icons/fallback-img.svg"}
            alt={`${chainName || "Network"} logo`}
            fill
            className="object-contain"
            style={{
              objectFit: "contain",
            }}
            priority
          />
        </div>
      </div>
    </div>
  )
}

export default AssetComboIcon

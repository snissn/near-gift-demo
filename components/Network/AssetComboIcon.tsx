import Image from "next/image"

import { NetworkToken } from "@/types/interfaces"

const AssetComboIcon = ({
  coinLogo,
  coinsName,
  networkLogo,
  networkName,
}: Omit<NetworkToken, "balance" | "balanceToUds">) => {
  return (
    <div className="relative inline-block">
      <div className="relative overflow-hidden w-[36px] h-[36px] flex justify-center items-center border border-silver-100 rounded-full">
        <Image
          src={coinLogo ?? ""}
          alt={coinsName || "Coin Logo"}
          fill
          style={{
            objectFit: "contain",
          }}
        />
      </div>
      <div className="absolute bottom-0 -right-[7px] flex justify-center items-center p-1 bg-black-300 rounded-full border-2 border-white">
        <Image
          src={networkLogo ?? ""}
          alt={networkName || "Network Logo"}
          width={6}
          height={6}
        />
      </div>
    </div>
  )
}

export default AssetComboIcon

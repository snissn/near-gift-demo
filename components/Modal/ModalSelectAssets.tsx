"use client"

import { useState, useDeferredValue } from "react"
import { Text } from "@radix-ui/themes"

import ModalDialog from "@/components/Modal/ModalDialog"
import SearchBar from "@/components/SearchBar"
import AssetList, { Asset } from "@/components/Network/AssetList"

const assetsEmptyList: Asset[] = []
const assets = [
  {
    coinLogo:
      "https://assets.coingecko.com/coins/images/20582/standard/aurora.jpeg?1696519989",
    coinsName: "Aurora",
    networkLogo: "/static/icons/network/near.svg",
    networkName: "AURORA",
    balance: "545.78",
    balanceToUds: "107.64",
  },
]

const ModalSelectAssets = () => {
  const [searchValue, setSearchValue] = useState("")
  const deferredQuery = useDeferredValue(searchValue)

  const handleSearchClear = () => setSearchValue("")

  const filterPattern = (asset: Asset) =>
    asset
      .coinsName!.toLocaleUpperCase()
      .includes(deferredQuery.toLocaleUpperCase()) ||
    asset
      .networkName!.toLocaleUpperCase()
      .includes(deferredQuery.toLocaleUpperCase())

  return (
    <ModalDialog>
      <div className="flex flex-col p-5 border-b border-gray-100">
        <SearchBar query={searchValue} setQuery={setSearchValue} />
      </div>
      {!deferredQuery.length && (
        <div className="border-b border-gray-100 p-2.5">
          <AssetList assets={assetsEmptyList} title="Your tokens" />
        </div>
      )}
      <div className="border-b border-gray-100 p-2.5">
        <AssetList
          assets={deferredQuery ? assets.filter(filterPattern) : assets}
          title={deferredQuery ? "Search results" : "Popular tokens"}
          className="min-h-[528px] h-full"
        />
        {deferredQuery && (
          <div className="flex justify-center items-center">
            <button
              onClick={handleSearchClear}
              className="mb-2.5 px-3 py-1.5 bg-red-100 rounded-full"
            >
              <Text size="2" weight="medium" className="text-red-400">
                Clear results
              </Text>
            </button>
          </div>
        )}
      </div>
    </ModalDialog>
  )
}

export default ModalSelectAssets

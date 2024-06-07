"use client"

import { useState, useDeferredValue } from "react"
import { Text } from "@radix-ui/themes"

import ModalDialog from "@/components/Modal/ModalDialog"
import SearchBar from "@/components/SearchBar"
import AssetList from "@/components/Network/AssetList"
import { NetworkToken } from "@/types/interfaces"
import { LIST_NETWORKS_TOKENS } from "@/constants/tokens"

const assetsEmptyList: NetworkToken[] = []

const ModalSelectAssets = () => {
  const [searchValue, setSearchValue] = useState("")
  const deferredQuery = useDeferredValue(searchValue)

  const handleSearchClear = () => setSearchValue("")

  const filterPattern = (asset: NetworkToken) =>
    asset
      .name!.toLocaleUpperCase()
      .includes(deferredQuery.toLocaleUpperCase()) ||
    asset
      .chainName!.toLocaleUpperCase()
      .includes(deferredQuery.toLocaleUpperCase())

  return (
    <ModalDialog>
      <div className="flex flex-col min-h-[680px] max-h-[680px] h-full">
        <div className="flex-none p-5 border-b border-gray-100">
          <SearchBar query={searchValue} setQuery={setSearchValue} />
        </div>
        {!deferredQuery.length && (
          <div className="flex-1 border-b border-gray-100 px-2.5 min-h-[228px] h-full max-h-[228px] overflow-y-auto">
            <AssetList
              assets={LIST_NETWORKS_TOKENS.slice(0, 5)}
              title="Your tokens"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-between border-b border-gray-100 px-2.5 overflow-y-auto">
          <AssetList
            assets={
              deferredQuery
                ? LIST_NETWORKS_TOKENS.filter(filterPattern)
                : LIST_NETWORKS_TOKENS
            }
            title={deferredQuery ? "Search results" : "Popular tokens"}
            className="h-full"
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
      </div>
    </ModalDialog>
  )
}

export default ModalSelectAssets

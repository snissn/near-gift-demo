"use client"

import { useState, useEffect, useCallback } from "react"
import { Text } from "@radix-ui/themes"

import ModalDialog from "@src/components/Modal/ModalDialog"
import SearchBar from "@src/components/SearchBar"
import AssetList from "@src/components/Network/AssetList"
import type { NetworkToken, NetworkTokenWithSwapRoute } from "@src/types/interfaces"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import type { ModalType } from "@src/stores/modalStore"
import { useTokensStore } from "@src/providers/TokensStoreProvider"
import { sortByTopBalances, tieNativeToWrapToken } from "@src/utils/tokenList"
import { useDiscoverDefuseAssets } from "@src/api/hooks/token/useDiscoverDefuseAssets"
import { debouncePromise } from "@src/utils/debouncePromise"
import parseDefuseAsset from "@src/utils/parseDefuseAsset"
import { tokenMetaAdapter } from "@src/utils/token"

export type ModalSelectAssetsPayload = {
  modalType?: ModalType.MODAL_SELECT_ASSETS
  token?: NetworkToken
  fieldName?: string
}

export interface TokenListWithNotSelectableToken
  extends NetworkTokenWithSwapRoute {
  isNotSelectable?: boolean
}

const DISCOVERY_ASSETS_AWAIT_MS = 500

const ModalSelectAssets = () => {
  const [assetList, setAssetList] = useState<NetworkTokenWithSwapRoute[]>([])
  const [assetListWithBalances, setAssetListWithBalances] = useState<
    NetworkTokenWithSwapRoute[]
  >([])
  const [newAssetList, setNewAssetList] = useState<NetworkTokenWithSwapRoute[]>(
    []
  )

  const { onCloseModal, modalType, payload } = useModalStore((state) => state)
  const { data, isLoading } = useTokensStore((state) => state)
  const [searchValue, setSearchValue] = useState("")
  const { data: dataDiscover, mutate } = useDiscoverDefuseAssets()

  const handleSearchClear = () => {
    setSearchValue("")
    setNewAssetList([])
  }

  const filterPattern = (asset: NetworkToken) =>
    parseDefuseAsset(asset.defuse_asset_id)
      ?.contractId!.toLocaleUpperCase()
      .includes(searchValue.toLocaleUpperCase())

  const handleSelectToken = (token: NetworkToken) => {
    onCloseModal({
      ...(payload as { fieldName: string }),
      modalType,
      token,
    })
  }

  const debouncedGetDiscoverDefuseAssets = useCallback(
    debouncePromise(
      async (address: string) => mutate(address),
      DISCOVERY_ASSETS_AWAIT_MS
    ),
    []
  )

  useEffect(() => {
    const discoverAssetList = dataDiscover?.result?.tokens
    if (discoverAssetList?.length) {
      const newDiscoverAssetList = discoverAssetList
        .filter(
          (discoverAsset) =>
            !assetList.some(
              (asset) =>
                asset.defuse_asset_id.toLowerCase() ===
                discoverAsset.defuse_asset_id.toLowerCase()
            )
        )
        .map(tokenMetaAdapter)
      setNewAssetList(newDiscoverAssetList)
    }
  }, [dataDiscover])

  useEffect(() => {
    if (!searchValue) return
    void debouncedGetDiscoverDefuseAssets(searchValue)
  }, [searchValue])

  useEffect(() => {
    if (!data.size && !isLoading) {
      return
    }
    const { selectToken, fieldName } = payload as {
      selectToken: NetworkTokenWithSwapRoute | undefined
      fieldName: string
    }

    const getAssetList: TokenListWithNotSelectableToken[] = []
    const getAssetListWithBalances: TokenListWithNotSelectableToken[] = []
    data.forEach((value) => {
      // Filtration by routes should happen only at "tokenIn" and for including in search it is enough to have only one route available.
      // We do not filter "tokenOut" allow solver router to find a proposition to swap
      if (fieldName === "tokenIn" && !value?.routes?.length) {
        return
      }

      let isNotSelectable = false
      const isAlreadySelected =
        selectToken && value.defuse_asset_id === selectToken.defuse_asset_id
      if (isAlreadySelected) {
        isNotSelectable = true
      }

      if (value?.balance) {
        getAssetListWithBalances.push({
          ...value,
          balance: value?.balance,
          isNotSelectable,
        })
      }
      getAssetList.push({ ...value, isNotSelectable })
    })
    setAssetList(tieNativeToWrapToken(getAssetList).sort(sortByTopBalances))
    setAssetListWithBalances(
      tieNativeToWrapToken(getAssetListWithBalances).sort(sortByTopBalances)
    )
  }, [data, isLoading])

  return (
    <ModalDialog>
      <div className="flex flex-col min-h-[680px] max-h-[680px] h-full">
        <div className="flex-none p-5 border-b border-gray-100 dark:border-black-950">
          <SearchBar
            query={searchValue}
            setQuery={setSearchValue}
            handleOverrideCancel={onCloseModal}
          />
        </div>
        {newAssetList.length ? (
          <div className="relative flex-1 border-b border-gray-100 px-2.5 min-h-[228px] h-full max-h-[228px] overflow-y-auto dark:border-black-950">
            <AssetList
              assets={newAssetList}
              title="Add tokens"
              handleSelectToken={handleSelectToken}
            />
          </div>
        ) : null}
        {!searchValue.length && assetListWithBalances.length ? (
          <div className="relative flex-1 border-b border-gray-100 px-2.5 min-h-[228px] h-full max-h-[228px] overflow-y-auto dark:border-black-950">
            <AssetList
              assets={assetListWithBalances}
              title="Your tokens"
              handleSelectToken={handleSelectToken}
            />
          </div>
        ) : null}
        <div className="flex-1 flex flex-col justify-between border-b border-gray-100 px-2.5 overflow-y-auto dark:border-black-950">
          <AssetList
            assets={searchValue ? assetList.filter(filterPattern) : assetList}
            title={searchValue ? "Search results" : "Popular tokens"}
            className="h-full"
            handleSelectToken={handleSelectToken}
          />
          {searchValue && (
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

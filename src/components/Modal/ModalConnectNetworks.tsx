"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Text, Tooltip } from "@radix-ui/themes"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { isAddress } from "ethers"
import * as bitcoin from "bitcoinjs-lib"

import { BlockchainEnum, type NetworkToken } from "@src/types/interfaces"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import Button from "@src/components/Button/Button"
import ModalDialog from "@src/components/Modal/ModalDialog"
import { ModalType } from "@src/stores/modalStore"
import NetworkNear from "@src/components/Network/NetworkNear"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import Network from "@src/components/Network/Network"
import { networkLabelAdapter } from "@src/utils/network"
import parseDefuseAsset from "@src/utils/parseDefuseAsset"
import { useTokensStore } from "@src/providers/TokensStoreProvider"
import { MapsEnum } from "@src/libs/de-sdk/utils/maps"
import {
  CONNECTOR_BTC_MAINNET,
  CONNECTOR_ETH_BASE,
} from "@src/constants/contracts"

export type ModalConnectNetworksPayload = {
  tokenIn: string
  tokenOut: string
  selectedTokenIn: NetworkToken
  selectedTokenOut: NetworkToken
  isNativeInSwap: boolean
  solverId: string
}

export const handleValidateAccount = (
  account: string,
  setErrorAccount: (value: string) => void,
  defuse_asset_id: string
): boolean => {
  const result = parseDefuseAsset(defuse_asset_id)
  const blockchain = result?.blockchain ?? ""
  switch (blockchain) {
    case BlockchainEnum.Eth:
      if (!isAddress(account)) {
        setErrorAccount("Invalid wallet address.")
        return false
      } else {
        setErrorAccount("")
        return true
      }
    case BlockchainEnum.Btc:
      try {
        bitcoin.address.toOutputScript(account)
        setErrorAccount("")
        return true
      } catch (e) {
        setErrorAccount("Invalid Bitcoin address.")
        return false
      }
    default:
      return false
  }
}

const handleGetStoreKey = (defuse_asset_id: string) => {
  const result = parseDefuseAsset(defuse_asset_id)
  if (!result) return ""
  switch (`${result.blockchain}:${result.network}`) {
    case MapsEnum.ETH_BASE:
      return CONNECTOR_ETH_BASE
    case MapsEnum.BTC_MAINNET:
      return CONNECTOR_BTC_MAINNET
  }
}

const ModalConnectNetworks = () => {
  const [accountFrom, setAccountFrom] = useState("")
  const [accountTo, setAccountTo] = useState("")
  const [errorAccountFrom, setErrorAccountFrom] = useState("")
  const [errorAccountTo, setErrorAccountTo] = useState("")
  const { onCloseModal, setModalType, payload } = useModalStore(
    (state) => state
  )
  const { accountId } = useWalletSelector()
  const { triggerTokenUpdate } = useTokensStore((state) => state)

  const { handleSignIn, handleSignOut } = useConnectWallet()
  const [convertPayload] = useState<ModalConnectNetworksPayload>(
    payload as ModalConnectNetworksPayload
  )

  const handleContinue = async () => {
    setModalType(ModalType.MODAL_REVIEW_SWAP, {
      ...(payload as ModalConnectNetworksPayload),
      accountFrom,
      accountTo,
    })
    triggerTokenUpdate()
  }

  const handleStoreAccount = (account: string, defuse_asset_id: string) => {
    const storeKey = handleGetStoreKey(defuse_asset_id)
    if (!storeKey) return
    localStorage.setItem(storeKey, account)
  }

  useEffect(() => {
    const chainName = convertPayload.selectedTokenIn?.blockchain
    if (chainName && accountId && chainName === "near") {
      setAccountFrom(accountId)
    }
  }, [convertPayload.selectedTokenIn.blockchain, accountId])

  useEffect(() => {
    const chainName = convertPayload.selectedTokenOut?.blockchain
    if (chainName && accountId && chainName === "near") {
      setAccountTo(accountId)
    }
  }, [convertPayload.selectedTokenOut.blockchain, accountId])

  return (
    <ModalDialog>
      <div className="flex flex-col min-h-[256px] max-h-[680px] h-full p-5">
        <div className="flex justify-between items-center mb-[44px]">
          <div className="relative w-full shrink text-center text-black-400">
            <Text size="4" weight="bold" className="dark:text-gray-500">
              Before we continue...
            </Text>
            <div className="w-full absolute top-[30px] left-[50%] -translate-x-2/4 flex justify-center items-center gap-1 text-gray-600">
              <Text size="2" weight="medium">
                Please connect your wallet on{" "}
                {networkLabelAdapter(
                  convertPayload?.selectedTokenOut?.defuse_asset_id ?? ""
                )}
              </Text>
              <Tooltip content="Please specify the wallet address on the specified network">
                <InfoCircledIcon />
              </Tooltip>
            </div>
          </div>
          <button className="shrink-0" onClick={onCloseModal}>
            <Image
              src="/static/icons/close.svg"
              alt="Close Icon"
              width={14}
              height={14}
            />
          </button>
        </div>
        <div className="w-full flex flex-col mb-6 relative">
          <div className="relative flex-1 p-[18px] border-[1px] border-gray-100 rounded-t-xl bg-gray dark:bg-black-900 dark:border-black-950">
            {convertPayload.selectedTokenIn?.blockchain === "near" ? (
              <NetworkNear
                chainIcon={convertPayload.selectedTokenIn?.chainIcon ?? ""}
                chainName={convertPayload.selectedTokenIn?.chainName ?? ""}
                account={accountFrom}
                onConnect={() => {
                  onCloseModal()
                  handleSignIn()
                }}
                onDisconnect={handleSignOut}
              />
            ) : (
              <Network
                chainIcon={convertPayload.selectedTokenIn?.chainIcon ?? ""}
                chainName={convertPayload.selectedTokenIn?.chainName ?? ""}
                account={accountFrom}
                onChange={(account) => setAccountFrom(account)}
                onBlur={(account) => {
                  const defuseAssetId =
                    convertPayload.selectedTokenIn?.defuse_asset_id ?? ""
                  if (
                    handleValidateAccount(
                      account,
                      setErrorAccountFrom,
                      defuseAssetId
                    )
                  ) {
                    handleStoreAccount(account, defuseAssetId)
                  }
                }}
              />
            )}
            {errorAccountFrom && (
              <div className="absolute bottom-2 left-[75px] flex justify-center items-center gap-2">
                <span className="text-sm text-red-400">{errorAccountFrom}</span>
              </div>
            )}
          </div>
          <div className="relative flex-1 p-[18px] border-[1px] border-gray-100 rounded-b-xl bg-gray dark:bg-black-900 dark:border-black-950">
            {convertPayload.selectedTokenOut?.blockchain === "near" ? (
              <NetworkNear
                chainIcon={convertPayload.selectedTokenOut?.chainIcon ?? ""}
                chainName={convertPayload.selectedTokenOut?.chainName ?? ""}
                account={accountTo}
                onConnect={() => {
                  onCloseModal()
                  handleSignIn()
                }}
                onDisconnect={handleSignOut}
              />
            ) : (
              <Network
                chainIcon={convertPayload.selectedTokenOut?.chainIcon ?? ""}
                chainName={convertPayload.selectedTokenOut?.chainName ?? ""}
                account={accountTo}
                onChange={(account) => setAccountTo(account)}
                onBlur={(account) => {
                  const defuseAssetId =
                    convertPayload.selectedTokenOut?.defuse_asset_id ?? ""
                  if (
                    handleValidateAccount(
                      account,
                      setErrorAccountTo,
                      defuseAssetId
                    )
                  ) {
                    handleStoreAccount(account, defuseAssetId)
                  }
                }}
              />
            )}
            {errorAccountTo && (
              <div className="absolute bottom-2 left-[75px] flex justify-center items-center gap-2">
                <span className="text-sm text-red-400">{errorAccountTo}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          size="lg"
          fullWidth
          onClick={handleContinue}
          disabled={
            !accountFrom || !accountTo || !!errorAccountFrom || !!errorAccountTo
          }
        >
          Continue
        </Button>
      </div>
    </ModalDialog>
  )
}

export default ModalConnectNetworks

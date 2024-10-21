"use client"

import { CopyIcon, EnterIcon } from "@radix-ui/react-icons"
import { Button, Separator, Text } from "@radix-ui/themes"
import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"

import NetworkIcon from "@src/components/Network/NetworkIcon"
import {
  CONNECTOR_BTC_MAINNET,
  CONNECTOR_ETH_BASE,
} from "@src/constants/contracts"
import { SignInType, useConnectWallet } from "@src/hooks/useConnectWallet"
import useShortAccountId from "@src/hooks/useShortAccountId"
import { getChainIconFromId } from "@src/hooks/useTokensListAdapter"
import { MapsEnum } from "@src/libs/de-sdk/utils/maps"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import { useTokensStore } from "@src/providers/TokensStoreProvider"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { ModalType } from "@src/stores/modalStore"

type WalletConnectionState = {
  chainIcon: string
  chainName: string
  chainLabel: string
  accountId: string | null
  index: number
}

type WalletConnectionActions = {
  onDisconnect: () => void
  onConnect?: () => void
  onCopy: () => void
  isCopied: boolean
}

const connections: MapsEnum[] = [
  MapsEnum.NEAR_MAINNET,
  MapsEnum.EVM_ETHEREUM,
  MapsEnum.BTC_MAINNET,
]

const WalletConnectionsConnector = ({
  accountId,
  chainName,
  chainLabel,
  chainIcon,
  onCopy,
  isCopied,
  onDisconnect,
  onConnect,
  index,
}: WalletConnectionState & WalletConnectionActions) => {
  const { shortAccountId } = useShortAccountId(accountId ?? "")
  return (
    <div className="flex flex-col justify-between items-center gap-2.5">
      {!index ? <Separator orientation="horizontal" size="4" /> : <div />}
      <div className="w-full flex justify-between items-center">
        <div className="flex justify-center items-center gap-4">
          <NetworkIcon
            chainIcon={chainIcon}
            chainName={chainName}
            isConnect={!!accountId}
          />
          <div className="flex flex-col">
            <Text size="2" weight="medium">
              {shortAccountId}
            </Text>
            <Text size="2" weight="medium" color="gray">
              {chainLabel}
            </Text>
          </div>
        </div>
        {accountId ? (
          <div className="flex justify-center items-center gap-2.5">
            <CopyToClipboard onCopy={onCopy} text={accountId ?? ""}>
              <button
                type={"button"}
                className={clsx(
                  "w-[32px] h-[32px] flex justify-center items-center rounded-full border border-gray-500 dark:border-white",
                  isCopied && "bg-primary border-0 text-white"
                )}
              >
                <CopyIcon width={16} height={16} />
              </button>
            </CopyToClipboard>
            <button
              type={"button"}
              onClick={onDisconnect}
              className="w-[32px] h-[32px] flex justify-center items-center rounded-full bg-white-200 dark:border dark:border-white"
            >
              <EnterIcon width={16} height={16} />
            </button>
          </div>
        ) : (
          <Button
            radius="full"
            variant="solid"
            color="orange"
            className="cursor-pointer"
            onClick={onConnect}
          >
            <Text size="2" weight="medium" wrap="nowrap">
              Connect wallet
            </Text>
          </Button>
        )}
      </div>
      <Separator orientation="horizontal" size="4" />
    </div>
  )
}

const WalletConnections = () => {
  const { state, signOut } = useConnectWallet()
  const { accountId } = useWalletSelector()
  const [copyWalletAddress, setCopyWalletAddress] = useState<MapsEnum>()
  const { setModalType } = useModalStore((state) => state)
  const { triggerTokenUpdate } = useTokensStore((state) => state)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleGetConnector = (connectorKey: string): string => {
    const getWalletFromLocal = localStorage.getItem(connectorKey)
    if (!getWalletFromLocal) return ""
    return getWalletFromLocal
  }

  const handleDisconnectSideWallet = (connectorKey: string) => {
    localStorage.removeItem(connectorKey)
    triggerTokenUpdate()
    // To force a rerender the component we update the state
    setIsProcessing(true)
  }

  useEffect(() => {
    // Finalize state update after forced re-render
    if (isProcessing) setIsProcessing(false)
  }, [isProcessing])

  return (
    <div className="flex flex-col">
      <Text
        size="1"
        weight="medium"
        className="text-gray-600 dark:text-gray-500 pb-2"
      >
        Connections
      </Text>
      {connections.map((connector, i) => {
        const defuse_asset_id = ""
        let chainIcon = ""
        const chainName = ""
        const accountIdFromLocal = ""
        const storeKey = ""
        switch (connector) {
          case MapsEnum.NEAR_MAINNET:
            if (state?.keyStore !== SignInType.NearWalletSelector) {
              return null
            }
            return (
              <WalletConnectionsConnector
                accountId={accountId}
                chainLabel="NEAR Protocol"
                chainName="near"
                chainIcon={getChainIconFromId(`${MapsEnum.NEAR_MAINNET}:0`)}
                onCopy={() => setCopyWalletAddress(MapsEnum.NEAR_MAINNET)}
                isCopied={copyWalletAddress === MapsEnum.NEAR_MAINNET}
                onDisconnect={() => {
                  signOut({ id: SignInType.NearWalletSelector })
                  triggerTokenUpdate()
                }}
                key={connector}
                index={i}
              />
            )
          case MapsEnum.EVM_ETHEREUM:
            if (state?.keyStore !== SignInType.WalletConnect) {
              return null
            }
            chainIcon = getChainIconFromId("eth")
            return (
              <WalletConnectionsConnector
                accountId={(state?.address as string) ?? null}
                chainLabel={state?.network ?? ""}
                chainName="eth"
                chainIcon={chainIcon}
                onCopy={() => setCopyWalletAddress(MapsEnum.EVM_ETHEREUM)}
                isCopied={copyWalletAddress === MapsEnum.EVM_ETHEREUM}
                onDisconnect={() => signOut({ id: SignInType.WalletConnect })}
                onConnect={() => {}}
                key={connector}
                index={i}
              />
            )
          case MapsEnum.BTC_MAINNET:
            if (state?.keyStore !== SignInType.Bitcoin) {
              return null
            }
            chainIcon = getChainIconFromId("btc:mainnet")
            return (
              <WalletConnectionsConnector
                accountId={accountIdFromLocal}
                chainLabel="Bitcoin"
                chainName={chainName}
                chainIcon={chainIcon}
                onCopy={() => setCopyWalletAddress(MapsEnum.BTC_MAINNET)}
                isCopied={copyWalletAddress === MapsEnum.BTC_MAINNET}
                onDisconnect={() => handleDisconnectSideWallet(storeKey)}
                onConnect={() =>
                  setModalType(ModalType.MODAL_STORE_NETWORK, {
                    storeKey,
                    defuse_asset_id,
                    chainIcon,
                    chainName,
                  })
                }
                key={connector}
                index={i}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}

export default WalletConnections

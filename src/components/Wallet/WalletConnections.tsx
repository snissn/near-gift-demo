"use client"

import React, { useState } from "react"
import { EnterIcon, CopyIcon } from "@radix-ui/react-icons"
import { Button, Separator, Text } from "@radix-ui/themes"
import { CopyToClipboard } from "react-copy-to-clipboard"
import clsx from "clsx"

import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { MapsEnum } from "@src/libs/de-sdk/utils/maps"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { getChainIconFromId } from "@src/hooks/useTokensListAdapter"
import NetworkIcon from "@src/components/Network/NetworkIcon"
import useShortAccountId from "@src/hooks/useShortAccountId"

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
  MapsEnum.ETH_BASE,
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
      {!index ? <Separator orientation="horizontal" size="4" /> : <div></div>}
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
                className={clsx(
                  "w-[32px] h-[32px] flex justify-center items-center rounded-full border border-gray-500 dark:border-white",
                  isCopied && "bg-primary border-0 text-white"
                )}
              >
                <CopyIcon width={16} height={16} />
              </button>
            </CopyToClipboard>
            <button
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
  const { accountId } = useWalletSelector()
  const { handleSignOut } = useConnectWallet()
  const [copyWalletAddress, setCopyWalletAddress] = useState<MapsEnum>()

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
        switch (connector) {
          case MapsEnum.NEAR_MAINNET:
            return (
              <WalletConnectionsConnector
                accountId={accountId}
                chainLabel="NEAR Protocol"
                chainName="near"
                chainIcon={getChainIconFromId(`${MapsEnum.NEAR_MAINNET}:0`)}
                onCopy={() => setCopyWalletAddress(MapsEnum.NEAR_MAINNET)}
                isCopied={copyWalletAddress === MapsEnum.NEAR_MAINNET}
                onDisconnect={handleSignOut}
                key={connector}
                index={i}
              />
            )
          case MapsEnum.ETH_BASE:
            return (
              <WalletConnectionsConnector
                accountId=""
                chainLabel="Base"
                chainName="eth"
                chainIcon={getChainIconFromId(`${MapsEnum.ETH_BASE}:0`)}
                onCopy={() => setCopyWalletAddress(MapsEnum.ETH_BASE)}
                isCopied={copyWalletAddress === MapsEnum.ETH_BASE}
                onDisconnect={handleSignOut}
                key={connector}
                index={i}
              />
            )
          case MapsEnum.BTC_MAINNET:
            return (
              <WalletConnectionsConnector
                accountId=""
                chainLabel="Bitcoin"
                chainName="btc"
                chainIcon={getChainIconFromId(`${MapsEnum.BTC_MAINNET}:0`)}
                onCopy={() => setCopyWalletAddress(MapsEnum.BTC_MAINNET)}
                isCopied={copyWalletAddress === MapsEnum.BTC_MAINNET}
                onDisconnect={handleSignOut}
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

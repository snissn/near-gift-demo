"use client"

import { Box, Spinner, Tabs, Text } from "@radix-ui/themes"
import { formatUnits } from "ethers"
import { type PropsWithChildren, useEffect, useState } from "react"

import LabelComingSoon from "@src/components/LabelComingSoon"
import { LIST_NATIVE_TOKENS } from "@src/constants/tokens"
import { useAccountBalance } from "@src/hooks/useAccountBalance"
import { useTokensStore } from "@src/providers/TokensStoreProvider"

const IS_DISABLED_ALL_TABS = true

const WalletTabBox = ({ children }: PropsWithChildren) => {
  return <div className="flex flex-col gap-2">{children}</div>
}

const TabTotalBalance = ({
  totalBalanceInUsd,
  isLoading,
}: {
  totalBalanceInUsd: number | undefined
  isLoading: boolean
}) => {
  return (
    <WalletTabBox>
      <Text
        size="1"
        weight="medium"
        className="text-gray-600 dark:text-gray-500"
      >
        Total balance
      </Text>
      {isLoading ? (
        <div className="flex h-[36px] items-center">
          <Spinner loading={isLoading} />
        </div>
      ) : (
        <Text size="7" weight="bold">
          ${totalBalanceInUsd ? totalBalanceInUsd?.toFixed(2) : "0.00"}
        </Text>
      )}
    </WalletTabBox>
  )
}

const WalletTabs = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { data, isLoading: isLoadingTokens } = useTokensStore((state) => state)
  const [totalBalanceInUsd, setTotalBalanceInUsd] = useState<
    number | undefined
  >()
  const { getAccountBalance } = useAccountBalance()

  const getBalanceToUsd = async () => {
    setIsLoading(true)
    let balanceInUsd = 0
    const temp = []
    let wNearConvertedLastUsd = 0

    for (const token of data.values()) {
      temp.push(token)
      if (token?.balanceUsd && token?.balanceUsd > 0) {
        balanceInUsd = Number(balanceInUsd) + Number(token.balanceUsd)
        if (token.defuse_asset_id === "near:mainnet:wrap.near") {
          assert(token.convertedLast, "Token convertedLast not found")
          wNearConvertedLastUsd = token.convertedLast.usd
        }
      }
    }

    const tokenNearNative = LIST_NATIVE_TOKENS.find(
      (token) => token.defuse_asset_id === "near:mainnet:native"
    )
    assert(tokenNearNative, "Token near native not found")
    const { balance } = await getAccountBalance()
    const nativeBalanceInUsd = formatUnits(
      BigInt(balance),
      tokenNearNative.decimals
    )

    balanceInUsd += Number(nativeBalanceInUsd) * wNearConvertedLastUsd

    setTotalBalanceInUsd(balanceInUsd)
    setIsLoading(false)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <reason>
  useEffect(() => {
    if (data.size) {
      void getBalanceToUsd()
    }
  }, [data.size, isLoadingTokens])

  return IS_DISABLED_ALL_TABS ? (
    <TabTotalBalance
      totalBalanceInUsd={totalBalanceInUsd}
      isLoading={isLoading}
    />
  ) : (
    <Tabs.Root defaultValue="account">
      <Tabs.List color="orange">
        <Tabs.Trigger value="available">Available</Tabs.Trigger>
        <Tabs.Trigger value="deposited" className="pointer-events-none">
          <div className="relative">
            Deposited
            <LabelComingSoon className="-top-4" />
          </div>
        </Tabs.Trigger>
      </Tabs.List>

      <Box pt="3" className="border-b-[1px] border-white-900 -mx-4 px-4">
        <Tabs.Content value="available">
          <TabTotalBalance
            totalBalanceInUsd={totalBalanceInUsd}
            isLoading={isLoading}
          />
        </Tabs.Content>

        <Tabs.Content value="deposited">
          <WalletTabBox>
            <Text size="2">Deposited</Text>
          </WalletTabBox>
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  )
}

export default WalletTabs

function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg)
  }
}

"use client"

import { useEffect, useState } from "react"
import { BigNumber } from "ethers"

import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { nep141Balance } from "@src/utils/near"
import {
  NetworkTokenWithSwapRoute,
  TokenBalance,
  NetworkEnum,
  BlockchainEnum,
} from "@src/types/interfaces"
import { useHistoryStore } from "@src/providers/HistoryStoreProvider"
import { useGetCoingeckoExchangesList } from "@src/api/hooks/exchanges/useGetCoingeckoExchangesList"
import { CoingeckoExchanges } from "@src/types/coingecko"
import { useAccountBalance } from "@src/hooks/useAccountBalance"
import parseDefuseAsset from "@src/utils/parseDefuseAsset"
import { useMinimumNearBalance } from "@src/hooks/useMinimumNearBalance"
import { W_NEAR_TOKEN_META } from "@src/constants/tokens"
import { balanceToDecimal } from "@src/components/SwapForm/service/balanceTo"
import { getBalanceNearAllowedToSwap } from "@src/components/SwapForm/service/getBalanceNearAllowedToSwap"

export const useGetTokensBalance = (
  tokensList: NetworkTokenWithSwapRoute[]
) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<NetworkTokenWithSwapRoute[]>([])
  const { accountId } = useWalletSelector()
  const { activePreview } = useHistoryStore((state) => state)
  const { data: exchangesList, isFetched } = useGetCoingeckoExchangesList()
  const { getAccountBalance } = useAccountBalance()
  const { minNearBalance } = useMinimumNearBalance(accountId)

  const isTokenNative = (address: string): boolean => {
    switch (address) {
      case "native":
        return true
      default:
        return false
    }
  }

  const getNearTokenBalance = async (
    address: string,
    decimals: number
  ): Promise<TokenBalance> => {
    const tokenBalance: TokenBalance = {}

    await getBalanceNearAllowedToSwap(accountId as string)

    if (accountId && isTokenNative(address)) {
      const { balance } = await getAccountBalance()
      if (balance) {
        Object.assign(tokenBalance, {
          balance,
        })
      }
    } else if (accountId && !isTokenNative(address)) {
      const balance = await nep141Balance(accountId, address)
      if (balance) {
        Object.assign(tokenBalance, { balance })
      }
    }

    const getCoinIndex = (
      exchangesList as CoingeckoExchanges
    )?.tickers?.findIndex((coin) => {
      return isTokenNative(address)
        ? coin.base.toLowerCase() === W_NEAR_TOKEN_META.address
        : coin.base.toLowerCase() === address.toLowerCase()
    })

    if (getCoinIndex !== -1) {
      const convertedLastUsd = (exchangesList as CoingeckoExchanges)?.tickers[
        getCoinIndex
      ].converted_last.usd
      if (convertedLastUsd) {
        Object.assign(tokenBalance, {
          convertedLast: { usd: convertedLastUsd },
        })
        if (tokenBalance?.balance) {
          const balanceUsd = balanceToDecimal(
            BigNumber.from(tokenBalance.balance)
              .mul(convertedLastUsd)
              .toString(),
            decimals
          )
          Object.assign(tokenBalance, {
            balanceUsd,
          })
        }
      }
    }

    return tokenBalance
  }

  const getTokensBalance = async () => {
    try {
      setIsFetching(true)
      const dataWithBalances = await Promise.all(
        tokensList.map(async (token) => {
          const result = parseDefuseAsset(token?.defuse_asset_id ?? "")
          if (!result) {
            return token
          }

          switch (result.blockchain) {
            case BlockchainEnum.Near:
              switch (result.network) {
                case NetworkEnum.Mainnet:
                  return {
                    ...token,
                    ...(await getNearTokenBalance(
                      result.contractId,
                      token?.decimals ?? 0
                    )),
                  }
                default:
                  return token
              }
              break
            default:
              return token
          }
        })
      )

      setData(dataWithBalances)
      setIsFetching(false)
    } catch (e) {
      console.log("useGetTokensBalance: ", e)
      setIsError(true)
      setIsFetching(false)
    }
  }

  const clearTokensBalance = () => {
    const dataCleanBalances = data.map(
      ({ balance, balanceUsd, convertedLast, ...rest }) => ({ ...rest })
    )
    setData(dataCleanBalances)
  }

  useEffect(() => {
    if (tokensList || activePreview || isFetched || minNearBalance) {
      getTokensBalance()
    }
  }, [accountId, tokensList, activePreview, isFetched, minNearBalance])

  useEffect(() => {
    if (!accountId) {
      clearTokensBalance()
    }
  }, [accountId])

  return {
    data,
    isFetching,
    isError,
  }
}

"use client"

import { useEffect, useState } from "react"
import { formatUnits } from "viem"

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
    let balance: number | undefined = undefined

    if (accountId && isTokenNative(address)) {
      const { balance } = await getAccountBalance()
      if (balance) {
        const formattedAmountOut = formatUnits(BigInt(balance), decimals)
        Object.assign(tokenBalance, { balance: parseFloat(formattedAmountOut) })
      }
    } else if (accountId && !isTokenNative(address)) {
      const getBalance = await nep141Balance(accountId as string, address)
      if (getBalance) {
        balance = Number(formatUnits(BigInt(getBalance as string), decimals))
        Object.assign(tokenBalance, { balance })
      }
    }

    const getCoinIndex = (
      exchangesList as CoingeckoExchanges
    )?.tickers?.findIndex((coin) => {
      return isTokenNative(address)
        ? coin.base.toLowerCase() === "wrap.near"
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
          const balanceToUsd = tokenBalance?.balance * convertedLastUsd
          Object.assign(tokenBalance, {
            balanceToUsd,
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
      ({ balance, balanceToUsd, convertedLast, ...rest }) => ({ ...rest })
    )
    setData(dataCleanBalances)
  }

  useEffect(() => {
    if (tokensList || activePreview || isFetched) {
      getTokensBalance()
    }
  }, [accountId, tokensList, activePreview, isFetched])

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

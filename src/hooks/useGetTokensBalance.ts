"use client"

import { useEffect, useState } from "react"

import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { nep141Balance } from "@src/utils/near"
import {
  NetworkTokenWithSwapRoute,
  TokenBalance,
  NetworkEnum,
  BlockchainEnum,
} from "@src/types/interfaces"
import { useHistoryStore } from "@src/providers/HistoryStoreProvider"
import { useGetCoingeckoExchangeList } from "@src/api/hooks/exchange/useGetCoingeckoExchangeList"
import { CoingeckoExchanges } from "@src/types/coingecko"
import { useAccountBalance } from "@src/hooks/useAccountBalance"
import parseDefuseAsset from "@src/utils/parseDefuseAsset"
import { useMinimumNearBalance } from "@src/hooks/useMinimumNearBalance"
import { W_BASE_TOKEN_META, W_NEAR_TOKEN_META } from "@src/constants/tokens"
import { balanceToDecimal } from "@src/components/SwapForm/service/balanceTo"
import { getBalanceNearAllowedToSwap } from "@src/components/SwapForm/service/getBalanceNearAllowedToSwap"
import {
  ethereumERC20Balance,
  ethereumNativeBalance,
} from "@src/utils/ethereum"
import { bitcoinNativeBalance } from "@src/utils/bitcoin"
import { getBitcoinPriceInUsd } from "@src/api/token"

const baseRpc = process.env.BASE_RPC || ""

export const useGetTokensBalance = (
  tokensList: NetworkTokenWithSwapRoute[]
) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<NetworkTokenWithSwapRoute[]>([])
  const { accountId } = useWalletSelector()
  const { activePreview } = useHistoryStore((state) => state)

  const { data: exchangesListNear, isFetched: isFetchedListNear } =
    useGetCoingeckoExchangeList("ref_finance")
  const { data: exchangesListBase, isFetched: isFetchedListBase } =
    useGetCoingeckoExchangeList("uniswap-v3-base")

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

  const assignConversionsContext = async (
    tokenBalance: TokenBalance,
    exchangesList: CoingeckoExchanges,
    wTokenAddress: string,
    address: string,
    decimals: number
  ) => {
    const getCoinIndex = exchangesList?.tickers?.findIndex((coin) => {
      return isTokenNative(address)
        ? coin.base.toLowerCase() === wTokenAddress
        : coin.base.toLowerCase() === address.toLowerCase()
    })

    if (getCoinIndex !== -1) {
      const convertedLastUsd =
        exchangesList?.tickers[getCoinIndex].converted_last.usd
      if (convertedLastUsd) {
        Object.assign(tokenBalance, {
          convertedLast: { usd: convertedLastUsd },
        })
        if (tokenBalance?.balance) {
          const balanceUsd =
            Number(balanceToDecimal(tokenBalance.balance, decimals)) *
            convertedLastUsd
          Object.assign(tokenBalance, {
            balanceUsd,
          })
        }
      }
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

    if (exchangesListBase) {
      const wTokenAddress = W_NEAR_TOKEN_META.address
      await assignConversionsContext(
        tokenBalance,
        exchangesListNear as CoingeckoExchanges,
        wTokenAddress,
        address,
        decimals
      )
    }

    return tokenBalance
  }

  const getBaseTokenBalance = async (
    address: string,
    decimals: number
  ): Promise<TokenBalance> => {
    const tokenBalance: TokenBalance = {}

    // TODO Get Ethereum accountId from wallet store
    const accountId = "0xd9f9fcf89743C6a6E7F19bc1AB7Ffe20b24771AA"
    if (accountId && isTokenNative(address)) {
      const balance = await ethereumNativeBalance(accountId, baseRpc)
      if (balance) {
        Object.assign(tokenBalance, {
          balance,
        })
      }
    } else if (accountId && !isTokenNative(address)) {
      const balance = await ethereumERC20Balance(accountId, address, baseRpc)
      if (balance) {
        Object.assign(tokenBalance, { balance })
      }
    }

    if (exchangesListBase) {
      const wTokenAddress = W_BASE_TOKEN_META.address
      await assignConversionsContext(
        tokenBalance,
        exchangesListBase as CoingeckoExchanges,
        wTokenAddress,
        address,
        decimals
      )
    }

    return tokenBalance
  }

  const getBitcoinTokenBalance = async (
    address: string,
    decimals: number
  ): Promise<TokenBalance> => {
    const tokenBalance: TokenBalance = {}

    // TODO Get Bitcoin accountId from wallet store
    const accountId = "1EqTDpr1c54Teeu4TjYRXjz9CsBtrb4nsz"
    if (accountId && isTokenNative(address)) {
      const balance = await bitcoinNativeBalance(accountId)
      if (balance) {
        Object.assign(tokenBalance, {
          balance,
        })
      }
    }

    const result = await getBitcoinPriceInUsd()
    const convertedLastUsd = result.bitcoin.usd
    if (convertedLastUsd) {
      Object.assign(tokenBalance, {
        convertedLast: { usd: convertedLastUsd },
      })
      if (tokenBalance?.balance) {
        const balanceUsd =
          Number(balanceToDecimal(tokenBalance.balance, decimals)) *
          convertedLastUsd
        Object.assign(tokenBalance, {
          balanceUsd,
        })
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
            case BlockchainEnum.Eth:
              switch (result.network) {
                case NetworkEnum.Base:
                  return {
                    ...token,
                    ...(await getBaseTokenBalance(
                      result.contractId,
                      token?.decimals ?? 0
                    )),
                  }
                default:
                  return token
              }
              break
            case BlockchainEnum.Btc:
              switch (result.network) {
                case NetworkEnum.Mainnet:
                  return {
                    ...token,
                    ...(await getBitcoinTokenBalance(
                      result.contractId,
                      token?.decimals ?? 0
                    )),
                  }
                default:
                  return token
              }
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
    if (accountId && tokensList && isFetchedListNear && isFetchedListBase) {
      void getTokensBalance()
    }
  }, [
    accountId,
    tokensList,
    activePreview,
    minNearBalance,
    isFetchedListNear,
    isFetchedListBase,
  ])

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

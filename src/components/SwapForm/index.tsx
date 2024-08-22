"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { FieldValues, useForm } from "react-hook-form"
import { formatUnits, parseUnits } from "viem"

import Paper from "@src/components/Paper"
import Form from "@src/components/Form"
import FieldComboInput from "@src/components/Form/FieldComboInput"
import Button from "@src/components/Button/Button"
import ButtonSwitch from "@src/components/Button/ButtonSwitch"
import { CONFIRM_SWAP_LOCAL_KEY } from "@src/constants/contracts"
import { useModalStore } from "@src/providers/ModalStoreProvider"
import { ModalType } from "@src/stores/modalStore"
import { NetworkToken, NetworkTokenWithSwapRoute } from "@src/types/interfaces"
import {
  ModalSelectAssetsPayload,
  TokenListWithNotSelectableToken,
} from "@src/components/Modal/ModalSelectAssets"
import useSwapEstimateBot from "@src/hooks/useSwapEstimateBot"
import { useModalSearchParams } from "@src/hooks/useModalSearchParams"
import { useCalculateTokenToUsd } from "@src/hooks/useCalculateTokenToUsd"
import { useTokensStore } from "@src/providers/TokensStoreProvider"
import { ModalConfirmSwapPayload } from "@src/components/Modal/ModalConfirmSwap"
import BlockEvaluatePrice from "@src/components/Block/BlockEvaluatePrice"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useWalletSelector } from "@src/providers/WalletSelectorProvider"
import { debouncePromise } from "@src/utils/debouncePromise"
import { tieNativeToWrapToken } from "@src/utils/tokenList"
import { smallNumberToString } from "@src/utils/token"

import {
  EvaluateResultEnum,
  getEvaluateSwapEstimate,
} from "./service/evaluateSwap"
import isForeignChainSwap from "./utils/isForeignChainSwap"
import isSameToken from "./utils/isSameToken"

type FormValues = {
  tokenIn: string
  tokenOut: string
}

type SelectToken = NetworkToken | undefined

type EstimateSwap = {
  tokenIn: string
  tokenOut: string
  name: string
  selectTokenIn: SelectToken
  selectTokenOut: SelectToken
}

enum ErrorEnum {
  INSUFFICIENT_BALANCE = "Insufficient Balance",
  NOT_AVAILABLE_SWAP = "Not Available Swap",
  NO_QUOTES = "No Quotes",
  EXCEEDED_NEAR_PER_BYTE_USE = "Must have 0.2N or more left in wallet",
}

const ESTIMATE_BOT_AWAIT_MS = 500

export default function Swap() {
  const [selectTokenIn, setSelectTokenIn] = useState<SelectToken>()
  const [selectTokenOut, setSelectTokenOut] = useState<SelectToken>()
  const [errorSelectTokenIn, setErrorSelectTokenIn] = useState("")
  const [errorSelectTokenOut, setErrorSelectTokenOut] = useState("")
  const { accountId } = useWalletSelector()
  const {
    priceToUsd: priceToUsdTokenIn,
    calculateTokenToUsd: calculateTokenToUsdTokenIn,
  } = useCalculateTokenToUsd()
  const {
    priceToUsd: priceToUsdTokenOut,
    calculateTokenToUsd: calculateTokenToUsdTokenOut,
  } = useCalculateTokenToUsd()
  const { data, isFetched, isLoading } = useTokensStore((state) => state)
  const { handleSignIn } = useConnectWallet()
  const [priceEvaluation, setPriceEvaluation] =
    useState<EvaluateResultEnum | null>(null)
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({ reValidateMode: "onSubmit" })
  const { setModalType, payload, onCloseModal } = useModalStore(
    (state) => state
  )
  const { bestEstimate, allEstimates, getSwapEstimateBot } =
    useSwapEstimateBot()
  const isProgrammaticUpdate = useRef(false)
  const lastInputValue = useRef("")
  useModalSearchParams()
  const [errorMsg, setErrorMsg] = useState<ErrorEnum>()
  const [isFetchingData, setIsFetchingData] = useState(false)

  const onSubmit = async (values: FieldValues) => {
    if (errorMsg) {
      return
    }
    if (!accountId) {
      return handleSignIn()
    }
    let hasUnsetTokens = false
    if (!selectTokenIn) {
      hasUnsetTokens = true
      setErrorSelectTokenIn("Select token is required")
    }
    if (!selectTokenOut) {
      hasUnsetTokens = true
      setErrorSelectTokenOut("Select token is required")
    }
    if (hasUnsetTokens) return
    setModalType(
      isForeignChainSwap(
        selectTokenIn?.defuse_asset_id as string,
        selectTokenOut?.defuse_asset_id as string
      )
        ? ModalType.MODAL_CONNECT_NETWORKS
        : ModalType.MODAL_REVIEW_SWAP,
      {
        tokenIn: values.tokenIn,
        tokenOut: values.tokenOut,
        selectedTokenIn: selectTokenIn,
        selectedTokenOut: selectTokenOut,
        solverId: bestEstimate?.solver_id || "",
      }
    )
  }

  const handleSwitch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isFetchingData) {
      return
    }
    setErrorMsg(undefined)
    setPriceEvaluation(null)
    const tempTokenInCopy = Object.assign({}, selectTokenIn)
    setSelectTokenIn(selectTokenOut)
    setSelectTokenOut(tempTokenInCopy)

    // Use isProgrammaticUpdate as true to prevent unnecessary estimate
    const valueTokenIn = getValues("tokenIn")
    const valueTokenOut = getValues("tokenOut")
    isProgrammaticUpdate.current = true
    setValue("tokenOut", valueTokenIn)
    isProgrammaticUpdate.current = true
    setValue("tokenIn", valueTokenOut)
    handleEstimateSwap({
      tokenIn: getValues("tokenIn"),
      tokenOut: getValues("tokenOut"),
      name: "tokenIn",
      selectTokenIn: selectTokenOut,
      selectTokenOut: tempTokenInCopy,
    })
  }

  const handleSelect = (fieldName: string, selectToken: SelectToken) => {
    setModalType(ModalType.MODAL_SELECT_ASSETS, { fieldName, selectToken })
  }

  const debouncedGetSwapEstimateBot = useCallback(
    debouncePromise(
      async (data: { tokenIn: string; tokenOut: string; amountIn: string }) =>
        getSwapEstimateBot(data),
      ESTIMATE_BOT_AWAIT_MS
    ),
    []
  )

  const handleEstimateSwap = async ({
    tokenIn,
    tokenOut,
    name,
    selectTokenIn,
    selectTokenOut,
  }: EstimateSwap) => {
    try {
      setErrorMsg(undefined)
      setPriceEvaluation(null)
      clearErrors()
      lastInputValue.current = tokenIn
      const parsedTokeinIn = parseFloat(tokenIn)
      // Empty input
      if (
        (name === "tokenIn" && !parsedTokeinIn) ||
        !selectTokenIn ||
        !selectTokenOut
      ) {
        isProgrammaticUpdate.current = true
        setValue("tokenOut", "")
        setIsFetchingData(false)
        return
      }
      if (parsedTokeinIn > (selectTokenIn?.balance ?? 0)) {
        setErrorMsg(ErrorEnum.INSUFFICIENT_BALANCE)
      }

      // TODO See comment below at [place-1]

      // Do not use any estimation of swap between Native and Token if ratio is 1:1
      const pair = [selectTokenIn.address, selectTokenOut.address]
      if (pair.includes("native") && pair.includes("wrap.near")) {
        isProgrammaticUpdate.current = true
        setIsFetchingData(false)
        return setValue(
          name === "tokenIn" ? "tokenOut" : "tokenIn",
          name === "tokenIn" ? tokenIn : tokenOut
        )
      }

      setIsFetchingData(true)
      const { bestEstimate } = await debouncedGetSwapEstimateBot({
        tokenIn: selectTokenIn.defuse_asset_id,
        tokenOut: selectTokenOut.defuse_asset_id,
        amountIn: parseUnits(tokenIn, selectTokenIn?.decimals ?? 0).toString(),
      })

      if (lastInputValue.current === tokenIn) {
        // no estimate available
        if (bestEstimate === null) {
          isProgrammaticUpdate.current = true
          setValue("tokenOut", "")
          setErrorMsg(ErrorEnum.NO_QUOTES)
          setIsFetchingData(false)
          return
        }
        getEvaluateSwapEstimate(
          selectTokenIn,
          selectTokenOut,
          tokenIn,
          bestEstimate.amount_out
        )
          .then(({ refFinance }) => {
            if (lastInputValue.current === tokenIn) {
              setPriceEvaluation(refFinance)
            }
          })
          .catch((e) => {
            console.error(e)
          })
        isProgrammaticUpdate.current = true
        const formattedOut =
          bestEstimate.amount_out !== null
            ? formatUnits(
                BigInt(bestEstimate.amount_out),
                selectTokenOut.decimals!
              )
            : "0"
        setValue("tokenOut", formattedOut)
        trigger("tokenOut")

        // TODO [place-1] Temporarily showing quote for tokens whose don't have routes,
        //      allowing solvers to integrate new protocols, and after `if` scope
        //      has to be returned to.
        if (
          !(selectTokenIn as NetworkTokenWithSwapRoute).routes?.includes(
            selectTokenOut.defuse_asset_id
          )
        ) {
          setErrorMsg(ErrorEnum.NOT_AVAILABLE_SWAP)
          isProgrammaticUpdate.current = true
          setIsFetchingData(false)
          // setValue("tokenOut", "")
          setValue("tokenOut", parseFloat(formattedOut) ? formattedOut : "")
          return
        }

        setIsFetchingData(false)
      }
    } catch (e) {
      console.error(e)
      setIsFetchingData(false)
    }
  }

  useEffect(() => {
    if (!selectTokenIn && !selectTokenOut) {
      const getConfirmSwapFromLocal = localStorage.getItem(
        CONFIRM_SWAP_LOCAL_KEY
      )
      if (getConfirmSwapFromLocal) {
        const parsedData: { data: ModalConfirmSwapPayload } = JSON.parse(
          getConfirmSwapFromLocal
        )
        const cleanBalance = {
          balance: 0,
          balanceToUsd: 0,
          convertedLast: 0,
        }
        setSelectTokenIn(
          Object.assign(parsedData.data.selectedTokenIn, cleanBalance)
        )
        setSelectTokenOut(
          Object.assign(parsedData.data.selectedTokenOut, cleanBalance)
        )
        return
      }
      if (data.size) {
        data.forEach((token) => {
          if (token.address === "near") {
            setSelectTokenIn(token)
          }
          if (token.address === "usdt") {
            setSelectTokenOut(token)
          }
        })
        return
      }
    }
    // Do evaluate usd select tokens prices
    if (data.size && !isLoading) {
      const getAssetList: TokenListWithNotSelectableToken[] = []
      data.forEach((value) => getAssetList.push(value))
      const tieNativeToWrapAssetList = tieNativeToWrapToken(getAssetList)
      tieNativeToWrapAssetList.forEach((token) => {
        if (selectTokenIn?.defuse_asset_id === token.defuse_asset_id) {
          setSelectTokenIn(token)
        }
        if (selectTokenOut?.defuse_asset_id === token.defuse_asset_id) {
          setSelectTokenOut(token)
        }
      })
    }
  }, [data, isFetched, isLoading])

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (isProgrammaticUpdate.current) {
        isProgrammaticUpdate.current = false
        return
      }
      handleEstimateSwap({
        tokenIn: String(value.tokenIn),
        tokenOut: String(value.tokenOut),
        name: name as string,
        selectTokenIn,
        selectTokenOut,
      })
    })
    return () => subscription.unsubscribe()
  }, [watch, selectTokenIn, selectTokenOut, getSwapEstimateBot, setValue])

  useEffect(() => {
    // Use to calculate when selectTokenIn or selectTokenOut is changed
    const valueTokenIn = getValues("tokenIn")
    const valueTokenOut = getValues("tokenOut")
    calculateTokenToUsdTokenIn(valueTokenIn, selectTokenIn)
    calculateTokenToUsdTokenOut(valueTokenOut, selectTokenOut)

    // Use watch to calculate when input is changed
    const subscription = watch((value) => {
      calculateTokenToUsdTokenIn(value.tokenIn as string, selectTokenIn)
      calculateTokenToUsdTokenOut(value.tokenOut as string, selectTokenOut)
    })
    return () => subscription.unsubscribe()
  }, [watch, selectTokenIn, selectTokenOut])

  useEffect(() => {
    if (
      (payload as ModalSelectAssetsPayload)?.modalType !==
      ModalType.MODAL_SELECT_ASSETS
    ) {
      return
    }
    const { modalType, fieldName, token } = payload as ModalSelectAssetsPayload
    if (modalType === ModalType.MODAL_SELECT_ASSETS && fieldName && token) {
      switch (fieldName) {
        case "tokenIn":
          setSelectTokenIn(token)
          const isSelectTokenOutReset = isSameToken(
            token,
            selectTokenOut as NetworkToken
          )

          if (isSelectTokenOutReset) {
            setSelectTokenOut(undefined)
            setValue("tokenOut", "")
          } else {
            handleEstimateSwap({
              tokenIn: getValues("tokenIn"),
              tokenOut: "",
              name: "tokenIn",
              selectTokenIn: token,
              selectTokenOut,
            })
          }
          isProgrammaticUpdate.current = false
          setErrorSelectTokenIn("")
          break
        case "tokenOut":
          setSelectTokenOut(token)
          const isSelectTokenInReset = isSameToken(
            token,
            selectTokenIn as NetworkToken
          )
          if (isSelectTokenInReset) {
            setSelectTokenIn(undefined)
            setValue("tokenIn", "")
          } else {
            handleEstimateSwap({
              tokenIn: getValues("tokenIn"),
              tokenOut: "",
              name: "tokenIn",
              selectTokenIn,
              selectTokenOut: token,
            })
          }
          isProgrammaticUpdate.current = false
          setErrorSelectTokenOut("")
          break
      }
      onCloseModal(undefined)
    }
  }, [payload, selectTokenIn, selectTokenOut])

  return (
    <Paper
      title="Swap"
      description="Cross-chain swap across any network, any token."
    >
      <Form<FormValues>
        handleSubmit={handleSubmit(onSubmit)}
        register={register}
      >
        <FieldComboInput<FormValues>
          fieldName="tokenIn"
          price={priceToUsdTokenIn}
          balance={selectTokenIn?.balance?.toString()}
          selected={selectTokenIn as NetworkToken}
          handleSelect={() => handleSelect("tokenIn", selectTokenOut)}
          handleSetMaxValue={() => {
            const balance = smallNumberToString(selectTokenIn?.balance ?? 0)
            setValue("tokenIn", balance)
          }}
          className="border rounded-t-xl md:max-w-[472px]"
          required="This field is required"
          errors={errors}
          errorSelect={errorSelectTokenIn}
        />
        <div className="relative w-full">
          <ButtonSwitch onClick={handleSwitch} />
        </div>
        <FieldComboInput<FormValues>
          fieldName="tokenOut"
          price={priceToUsdTokenOut}
          label={
            <BlockEvaluatePrice
              priceEvaluation={priceEvaluation}
              priceResults={allEstimates}
              tokenOut={selectTokenOut}
            />
          }
          balance={selectTokenOut?.balance?.toString()}
          selected={selectTokenOut as NetworkToken}
          handleSelect={() => handleSelect("tokenOut", selectTokenIn)}
          className="border rounded-b-xl mb-5 md:max-w-[472px]"
          required="This field is required"
          errors={errors}
          errorSelect={errorSelectTokenOut}
          disabled={true}
        />
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isFetchingData}
          disabled={Boolean(errorMsg)}
        >
          {isFetchingData ? "" : errorMsg ? errorMsg : "Swap"}
        </Button>
      </Form>
    </Paper>
  )
}

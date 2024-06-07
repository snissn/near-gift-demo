"use client"

import React, { useLayoutEffect, useState } from "react"
import { FieldValues } from "react-hook-form"

import Paper from "@/components/Paper"
import Form from "@/components/Form"
import FieldComboInput from "@/components/Form/FieldComboInput"
import Button from "@/components/Button"
import Switch from "@/components/Switch"
import { useSwap } from "@/hooks/useSwap"
import { LIST_NETWORKS_TOKENS, TOKENS } from "@/constants/tokens"
import { useWalletSelector } from "@/providers/WalletSelectorProvider"
import { useModalStore } from "@/providers/ModalStoreProvider"
import { ModalType } from "@/stores/modalStore"
import { NetworkToken } from "@/types/interfaces"

type FormValues = {
  tokenIn: string
  tokenOut: string
}

export default function Swap() {
  const [selectTokenIn, setSelectTokenIn] = useState<NetworkToken>(
    LIST_NETWORKS_TOKENS[0]
  )
  const [selectTokenOut, setSelectTokenOut] = useState<NetworkToken>(
    LIST_NETWORKS_TOKENS[2]
  )
  const { selector, accountId } = useWalletSelector()
  const { setModalType } = useModalStore((state) => state)
  const { onChangeInputToken, onChangeOutputToken, callRequestIntent } =
    useSwap({ selector, accountId })

  useLayoutEffect(() => {
    // TODO Temporary mock selections of Input/Output Tokens
    onChangeInputToken({
      address: TOKENS.AURORA.contract,
      symbol: TOKENS.AURORA.symbol,
      name: "AURORA",
      decimals: TOKENS.AURORA.decimals,
      icon: "https://assets.coingecko.com/coins/images/20582/standard/aurora.jpeg?1696519989",
    })
    onChangeOutputToken({
      address: TOKENS.REF.contract,
      symbol: TOKENS.REF.symbol,
      name: "REF",
      decimals: TOKENS.REF.decimals,
      icon: "https://assets.coingecko.com/coins/images/10365/standard/near.jpg?1696510367",
    })
  }, [])

  const handleSubmit = async (values: FieldValues) => {
    await callRequestIntent({
      inputAmount: values.tokenIn,
    })
  }
  const handleSwitch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log("form switch")
  }
  const handleSetMax = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log("form set max")
  }

  const handleSelect = () => {
    setModalType(ModalType.MODAL_SELECT_ASSETS)
  }

  return (
    <Paper
      title="Swap"
      description="Cross-chain swap across any network, any token."
    >
      <Form<FormValues> onSubmit={handleSubmit}>
        <FieldComboInput<FormValues>
          fieldName="tokenIn"
          price={selectTokenIn?.balanceToUds}
          balance={selectTokenIn?.balance}
          selected={selectTokenIn}
          handleSelect={handleSelect}
          handleSetMax={handleSetMax}
          className="border rounded-t-xl"
        />
        <Switch onClick={handleSwitch} />
        <FieldComboInput<FormValues>
          fieldName="tokenOut"
          price={selectTokenOut?.balanceToUds}
          selected={selectTokenOut}
          className="border rounded-b-xl mb-5"
        />
        <Button type="submit" size="lg" fullWidth>
          Swap
        </Button>
      </Form>
    </Paper>
  )
}

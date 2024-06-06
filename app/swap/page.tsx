"use client"

import React, { useLayoutEffect } from "react"
import { FieldValues } from "react-hook-form"

import Paper from "@/components/Paper"
import Form from "@/components/Form"
import FieldComboInput from "@/components/Form/FieldComboInput"
import Button from "@/components/Button"
import Switch from "@/components/Switch"
import { useSwap } from "@/hooks/useSwap"
import { TOKENS } from "@/constants/tokens"
import { useWalletSelector } from "@/providers/WalletSelectorProvider"
import { useModalStore } from "@/providers/ModalStoreProvider"
import { ModalType } from "@/stores/modalStore"

type FormValues = {
  tokenIn: string
  tokenOut: string
}

export default function Swap() {
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
      logoURI:
        "https://assets.coingecko.com/coins/images/20582/standard/aurora.jpeg?1696519989",
    })
    onChangeOutputToken({
      address: TOKENS.REF.contract,
      symbol: TOKENS.REF.symbol,
      name: "REF",
      decimals: TOKENS.REF.decimals,
      logoURI:
        "https://assets.coingecko.com/coins/images/10365/standard/near.jpg?1696510367",
    })
  }, [])

  const handleSubmit = async (values: FieldValues) => {
    await callRequestIntent({
      inputAmount: values.tokenIn,
    })
  }
  const handleSwitch = () => {
    console.log("form switch")
  }
  const handleSetMax = () => {
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
          price="63.83"
          balance="515.22"
          handleSelect={handleSelect}
          handleSetMax={handleSetMax}
          selected={{ name: "AURORA" }}
          className="border rounded-t-xl"
        />
        <Switch onClick={handleSwitch} />
        <FieldComboInput<FormValues>
          fieldName="tokenOut"
          price="39.16"
          selected={{ name: "1INCH" }}
          className="border rounded-b-xl mb-5"
        />
        <Button type="submit" size="lg" fullWidth>
          Swap
        </Button>
      </Form>
    </Paper>
  )
}

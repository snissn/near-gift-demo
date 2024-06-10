"use client"

import React, { useEffect, useState } from "react"
import { FieldValues } from "react-hook-form"

import Paper from "@/components/Paper"
import Form from "@/components/Form"
import FieldComboInput from "@/components/Form/FieldComboInput"
import Button from "@/components/Button"
import Switch from "@/components/Switch"
import { useSwap } from "@/hooks/useSwap"
import { LIST_NETWORKS_TOKENS } from "@/constants/tokens"
import { useWalletSelector } from "@/providers/WalletSelectorProvider"
import { useModalStore } from "@/providers/ModalStoreProvider"
import { ModalType } from "@/stores/modalStore"
import { NetworkToken } from "@/types/interfaces"

type FormValues = {
  tokenIn: string
  tokenOut: string
}

export default function Swap() {
  const [selectTokenIn, setSelectTokenIn] = useState<NetworkToken | undefined>(
    LIST_NETWORKS_TOKENS[0]
  )
  const [selectTokenOut, setSelectTokenOut] = useState<
    NetworkToken | undefined
  >(LIST_NETWORKS_TOKENS[1])
  const { selector, accountId } = useWalletSelector()
  const { setModalType, payload } = useModalStore((state) => state)
  const { onChangeInputToken, onChangeOutputToken, callRequestIntent } =
    useSwap({ selector, accountId })

  const handleResetToken = (
    token: NetworkToken,
    checkToken: NetworkToken,
    setSelectToken: (value?: NetworkToken) => void
  ) => {
    if (
      token.address === checkToken?.address &&
      token.chainId === checkToken?.chainId
    ) {
      setSelectToken(undefined)
    }
  }

  useEffect(() => {
    if (
      payload?.modalType === ModalType.MODAL_SELECT_ASSETS &&
      payload?.fieldName &&
      payload?.token
    ) {
      switch (payload!.fieldName) {
        case "tokenIn":
          setSelectTokenIn(payload!.token)
          onChangeInputToken(payload!.token)
          handleResetToken(payload!.token, selectTokenOut, setSelectTokenOut)
          break
        case "tokenOut":
          setSelectTokenOut(payload!.token)
          onChangeOutputToken(payload!.token)
          handleResetToken(payload!.token, selectTokenIn, setSelectTokenIn)
          break
      }
    }
  }, [payload?.modalType, payload?.payload, selectTokenIn, selectTokenOut])

  const handleSubmit = async (values: FieldValues) => {
    await callRequestIntent({
      inputAmount: values.tokenIn,
    })
  }

  const handleSwitch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const tempCopy = Object.assign({}, selectTokenIn)
    setSelectTokenIn(selectTokenOut)
    setSelectTokenOut(tempCopy)
  }

  const handleSetMax = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log("form set max")
  }

  const handleSelect = (fieldName: string) => {
    setModalType(ModalType.MODAL_SELECT_ASSETS, { fieldName })
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
          handleSelect={() => handleSelect("tokenIn")}
          handleSetMax={handleSetMax}
          className="border rounded-t-xl"
        />
        <Switch onClick={handleSwitch} />
        <FieldComboInput<FormValues>
          fieldName="tokenOut"
          price={selectTokenOut?.balanceToUds}
          selected={selectTokenOut}
          handleSelect={() => handleSelect("tokenOut")}
          className="border rounded-b-xl mb-5"
        />
        <Button type="submit" size="lg" fullWidth>
          Swap
        </Button>
      </Form>
    </Paper>
  )
}

"use client"

import { FieldValues } from "react-hook-form"
import React from "react"

import Paper from "@/components/Paper"
import { FieldComboInput, Form, FieldTextInput } from "@/components/Form"
import Button from "@/components/Button"

type FormValues = {
  tokenIn: string
  walletTo: string
}

export default function Withdraw() {
  const handleSubmit = (values: FieldValues) => {
    console.log(values, "form submit")
  }
  const handleSetMax = () => {
    console.log("form set max")
  }
  return (
    <Paper title="Withdraw">
      <Form<FormValues> onSubmit={handleSubmit}>
        <FieldComboInput<FormValues>
          fieldName="tokenIn"
          label="You’re sending"
          price="58.95"
          balance="515.22"
          handleSetMax={handleSetMax}
          selected={{ name: "AURORA" }}
        />
        <div className="h-[10px]"></div>
        <FieldTextInput
          fieldName="walletTo"
          label="To"
          placeholder="Enter wallet address"
        />
        <div className="h-[20px]"></div>
        <Button type="submit" size="lg" fullWidth>
          Send
        </Button>
      </Form>
    </Paper>
  )
}

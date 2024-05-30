"use client"

import React from "react"
import { FieldValues } from "react-hook-form"
import Image from "next/image"

import Paper from "@/components/Paper"
import { Form, FieldComboInput } from "@/components/Form"
import Button from "@/components/Button"
import Switch from "@/components/Switch"
import Accordion from "@/components/Accordion"

type FormValues = {
  tokenIn: string
  tokenOut: string
}

export default function Swap() {
  const handleSubmit = (values: FieldValues) => {
    console.log(values, "form submit")
  }
  const handleSwitch = () => {
    console.log("form switch")
  }
  const handleSetMax = () => {
    console.log("form set max")
  }
  return (
    <Paper
      title="Swap"
      description="Cross-chain swap across any network, any token."
    >
      <Form<FormValues> onSubmit={handleSubmit}>
        <FieldComboInput<FormValues>
          fieldName="tokenIn"
          label="You pay"
          price="39.60"
          balance="515.22"
          handleSetMax={handleSetMax}
          selected={{ name: "AURORA" }}
        />
        <Switch onClick={handleSwitch} />
        <FieldComboInput<FormValues>
          fieldName="tokenOut"
          label="You receive"
          price="39.16"
          selected={{ name: "1INCH" }}
        />
        <Accordion
          leftHeaderElement={
            <>
              <span className="w-[20px] h-[20px] rounded-[4px] bg-gray-500"></span>
              <span className="text-sm font-medium">Gas</span>
            </>
          }
          rightHeaderElement={
            <>
              <Image
                src="/static/icons/fire.svg"
                width={12}
                height={16}
                alt="caret-down"
              />
              <span className="text-sm font-bold">Free</span>
              <span className="text-sm font-medium text-gray-700 line-through">
                $7.27
              </span>
            </>
          }
        />
        <Button type="submit" size="lg" fullWidth>
          Swap
        </Button>
      </Form>
    </Paper>
  )
}

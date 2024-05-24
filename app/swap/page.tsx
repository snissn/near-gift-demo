"use client"

import { FieldValues } from "react-hook-form"

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
    <Paper title="Swap">
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
        <Accordion />
        <Button type="submit" size="lg" fullWidth>
          Swap
        </Button>
      </Form>
    </Paper>
  )
}

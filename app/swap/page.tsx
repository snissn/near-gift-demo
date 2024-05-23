"use client"

import { FieldValues } from "react-hook-form"

import Paper from "@/components/Paper"
import { Form } from "@/components/Form"
import FieldComboInput from "@/components/Form/FieldComboInput"
import Button from "@/components/Button"

type FormValues = {
  tokenIn: string
  tokenOut: string
}

export default function Swap() {
  const handleSubmit = (values: FieldValues) => {
    console.log(values, "form submit")
  }
  return (
    <Paper title="Swap">
      <Form<FormValues> onSubmit={handleSubmit}>
        <FieldComboInput<FormValues> fieldName="tokenIn" />
        <FieldComboInput<FormValues> fieldName="tokenOut" />
        <Button type="submit">Swap</Button>
      </Form>
    </Paper>
  )
}

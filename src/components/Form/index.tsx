"use client"

import React, {
  PropsWithChildren,
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
} from "react"
import { useForm, UseFormRegister, FieldValues } from "react-hook-form"

// Define an interface for components that accept register as a prop
interface RegisterProps<T extends FieldValues> {
  register: UseFormRegister<T>
}

interface Props<T extends FieldValues> extends PropsWithChildren {
  onSubmit: (props: T) => void
}

const Form = <T extends FieldValues>({ children, onSubmit }: Props<T>) => {
  const { handleSubmit, register } = useForm<T>()

  const childrenWithProps = Children.map(children, (child) => {
    if (isValidElement(child)) {
      // Ensure that the child is a ReactElement and pass the register prop correctly
      return cloneElement(child as ReactElement<RegisterProps<T>>, {
        register,
      })
    }
    return child
  })

  return <form onSubmit={handleSubmit(onSubmit)}>{childrenWithProps}</form>
}

export default Form

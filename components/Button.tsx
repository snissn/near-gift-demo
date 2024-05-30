import { ReactNode, ButtonHTMLAttributes } from "react"
import { FieldValues, UseFormRegister } from "react-hook-form"
import clsx from "clsx"
import { Button, Text } from "@radix-ui/themes"

interface Props<T extends FieldValues>
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  variant?: "primary" | "secondary"
  size?: "sm" | "base" | "lg"
  fullWidth?: boolean
  register?: UseFormRegister<T>
}

const CustomButton = <T extends FieldValues>({
  children,
  variant = "primary",
  size = "base",
  fullWidth,
  register,
  ...rest
}: Props<T>) => {
  const buttonBaseStyle = "cursor-pointer"

  let buttonVariantStyle: string
  let buttonColorStyle: string
  switch (variant) {
    case "primary":
      buttonVariantStyle = "classic"
      buttonColorStyle = "orange"
      break
    case "secondary":
      buttonVariantStyle = ""
      break
  }

  let buttonSizeStyle: string
  let buttonTextSizeStyle: string
  switch (size) {
    case "sm":
      buttonSizeStyle = ""
      buttonTextSizeStyle = "1"
      break
    case "base":
      buttonSizeStyle = ""
      buttonTextSizeStyle = "2"
      break
    case "lg":
      buttonSizeStyle = "h-[56px] rounded-[0.5rem]"
      buttonTextSizeStyle = "6"
      break
  }

  const buttonStyle = clsx(
    buttonBaseStyle,
    buttonSizeStyle,
    fullWidth && "w-full block"
  )

  return (
    <Button
      variant={buttonVariantStyle}
      color={buttonColorStyle}
      className={buttonStyle}
      {...rest}
    >
      <Text size={buttonTextSizeStyle}>{children}</Text>
    </Button>
  )
}

export default CustomButton

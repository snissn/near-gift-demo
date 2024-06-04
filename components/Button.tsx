import { ReactNode, ButtonHTMLAttributes } from "react"
import { FieldValues, UseFormRegister } from "react-hook-form"
import clsx from "clsx"
import { Button, Text, ButtonProps, TextProps } from "@radix-ui/themes"

interface Props<T extends FieldValues>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
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
  const buttonBaseStyle = "cursor-pointer whitespace-nowrap"

  let buttonVariantStyle: ButtonProps["variant"]
  let buttonColorStyle: ButtonProps["color"]
  switch (variant) {
    case "primary":
      buttonVariantStyle = "classic"
      buttonColorStyle = "orange"
      break
    case "secondary":
      buttonVariantStyle = "outline"
      buttonColorStyle = "gray"
      break
  }

  let buttonSizeStyle: string
  let buttonTextSizeStyle: TextProps["size"]
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
      className={buttonStyle}
      color={buttonColorStyle}
      {...rest}
    >
      <Text size={buttonTextSizeStyle}>{children}</Text>
    </Button>
  )
}

export default CustomButton

import { ReactNode, ButtonHTMLAttributes } from "react"
import { FieldValues, UseFormRegister } from "react-hook-form"
import clsx from "clsx"

interface Props<T extends FieldValues>
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  variant?: "primary" | "secondary"
  size?: "sm" | "base" | "lg"
  fullWidth?: boolean
  register?: UseFormRegister<T>
}

const Button = <T extends FieldValues>({
  children,
  variant = "primary",
  size = "base",
  fullWidth,
  register,
  ...rest
}: Props<T>) => {
  const buttonBaseStyle =
    "inline-flex justify-center items-center whitespace-nowrap"

  let buttonVariantStyle: string
  switch (variant) {
    case "primary":
      buttonVariantStyle = ""
      break
    case "secondary":
      buttonVariantStyle = ""
      break
  }

  let buttonSizeStyle: string
  switch (size) {
    case "sm":
      buttonSizeStyle = ""
      break
    case "base":
      buttonSizeStyle = ""
      break
    case "lg":
      buttonSizeStyle = "p-[15px] bg-black-500 rounded-full text-white text-lg"
      break
  }

  const buttonStyle = clsx(
    buttonBaseStyle,
    buttonVariantStyle,
    buttonSizeStyle,
    fullWidth && "w-full block"
  )

  return (
    <button {...rest} className={buttonStyle}>
      {children}
    </button>
  )
}

export default Button

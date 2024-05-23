import { ReactNode, ButtonHTMLAttributes } from "react"
import { FieldValues, UseFormRegister } from "react-hook-form"

interface Props<T extends FieldValues>
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  variant?: "primary" | "secondary"
  register?: UseFormRegister<T>
}

const Button = <T extends FieldValues>({
  children,
  variant,
  register,
  ...rest
}: Props<T>) => {
  return <button {...rest}>{children}</button>
}

export default Button

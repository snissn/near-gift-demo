import { Path, FieldValues, UseFormRegister } from "react-hook-form"
import clsx from "clsx"

import { NetworkSwitch } from "@/components/Network"
import { Network } from "@/components/Network/NetworkSwitch"

interface Props<T extends FieldValues> {
  fieldName: Path<T>
  register?: UseFormRegister<T>
  required?: boolean
  placeholder?: string
  label?: string
  price?: string
  balance?: string
  handleSetMax?: () => void
  selected: Network
  onSelect?: (network: Network) => void
  className?: string
}

const FieldComboInput = <T extends FieldValues>({
  fieldName,
  register,
  required,
  placeholder = "0",
  label,
  price,
  balance,
  handleSetMax,
  selected,
  onSelect,
  className,
}: Props<T>) => {
  if (!register) {
    return null
  }
  // TODO Error has to be propagated from parent Form
  const error = false
  return (
    <div
      className={clsx(
        "relative flex justify-between items-center px-5 py-[2.375rem] w-full bg-gray-50",
        !label && "pt-5",
        !price && !balance && !error && "pb-5",
        className && className
      )}
    >
      {label && (
        <span className="absolute top-4 left-5 text-sm font-medium text-secondary">
          {label}
        </span>
      )}
      <input
        {...register(fieldName, { required })}
        placeholder={placeholder}
        className={clsx(
          "bg-gray-50 text-3xl font-medium placeholder-black border-transparent focus:border-transparent focus:ring-0"
        )}
      />
      {price && (
        <span className="absolute bottom-4 left-5 text-sm font-medium text-secondary">
          ~${price}
        </span>
      )}
      <NetworkSwitch selected={selected} handleSwitch={onSelect} />
      {balance && (
        <div className="absolute bottom-4 right-5 flex justify-center items-center gap-2">
          <span className="text-xs text-secondary">Balance: ${balance}</span>
          {handleSetMax && (
            <button className="text-xs uppercase" onClick={handleSetMax}>
              max
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default FieldComboInput

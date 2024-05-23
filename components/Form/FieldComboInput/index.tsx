import { Path, FieldValues, UseFormRegister } from "react-hook-form"

interface Props<T extends FieldValues> {
  fieldName: Path<T>
  register?: UseFormRegister<T>
  required?: boolean
}

const FieldComboInput = <T extends FieldValues>({
  fieldName,
  register,
  required,
}: Props<T>) => {
  if (!register) {
    return null
  }
  return (
    <div className="relative">
      <input {...register(fieldName, { required })} />
    </div>
  )
}

export default FieldComboInput

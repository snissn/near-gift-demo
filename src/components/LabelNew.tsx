import { Text } from "@radix-ui/themes"
import clsx from "clsx"
import type { PropsWithChildren } from "react"

type Props = PropsWithChildren & {
  className?: string
}

const LabelNew = ({ children, className }: Props) => {
  return (
    <div className={"w-full relative"}>
      <Text
        weight="medium"
        color="green"
        className={clsx("absolute text-[8px] top-[-8px] right-0", className)}
      >
        new
      </Text>
      {children}
    </div>
  )
}

export default LabelNew

"use client"

import clsx from "clsx"
import type { ComponentType } from "react"

type Props<T> = {
  Component: ComponentType<T>
  data: T[]
  className?: string
}

const WidgetDataList = <T,>({ data, className, Component }: Props<T>) => {
  return (
    <div
      className={clsx(
        "flex flex-col max-h-[576px] overflow-auto",
        className && className
      )}
    >
      {data.map((props, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <reason>
        <Component {...props} key={index} />
      ))}
    </div>
  )
}

export default WidgetDataList

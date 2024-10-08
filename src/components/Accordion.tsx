import Image from "next/image"
import type React from "react"

type Props = {
  leftHeaderElement?: React.ReactNode
  rightHeaderElement?: React.ReactNode
}

const Accordion = ({ leftHeaderElement, rightHeaderElement }: Props) => {
  return (
    <button
      type={"button"}
      className="w-full flex justify-between items-center my-5 bg-gray-300 rounded-[10px] px-5 py-3"
    >
      <div className="flex justify-center items-center gap-2.5">
        {leftHeaderElement}
      </div>
      <div className="flex justify-center items-center gap-2.5">
        {rightHeaderElement}
        <Image
          src="/static/icons/caret-down.svg"
          width={25}
          height={25}
          alt="caret-down"
        />
      </div>
    </button>
  )
}

export default Accordion

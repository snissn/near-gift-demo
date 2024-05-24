import Image from "next/image"

type Props = {
  onClick: () => void
}

const Switch = ({ onClick }: Props) => {
  return (
    <div className="relative w-full h-[10px]">
      <button
        className="absolute top-[50%] left-[50%] -translate-x-2/4 -translate-y-2/4 z-10 flex justify-center items-center min-w-[40px] min-h-[40px] rounded-md bg-silver-200"
        onClick={onClick}
      >
        <Image
          src="/static/icons/arrow-down.svg"
          width={18}
          height={18}
          alt="arrow-down"
        />
      </button>
    </div>
  )
}

export default Switch

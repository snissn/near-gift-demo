import Image from "next/image"

export type Network = {
  name: string
}

type Props = {
  selected: Network
  handleSwitch?: (network: Network) => void
}

const NetworkSwitch = ({ selected, handleSwitch }: Props) => {
  return (
    <button
      onClick={() => handleSwitch && handleSwitch(selected)}
      className="bg-gray-200 rounded-full flex justify-between items-center p-1.5 gap-2.5"
    >
      <span className="relative w-[28px] h-[28px] bg-gray-400 rounded-full"></span>
      <span className="text-sm uppercase">{selected.name}</span>
      <Image
        src="/static/icons/caret-down.svg"
        width={25}
        height={25}
        alt="caret-down"
      />
    </button>
  )
}

export default NetworkSwitch

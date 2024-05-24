import Image from "next/image"

const Accordion = () => {
  return (
    <button className="w-full flex justify-between items-center my-5 bg-gray-300 rounded-[10px] px-5 py-3">
      <div className="flex justify-center items-center gap-2.5">
        <span className="w-[20px] h-[20px] rounded-[4px] bg-gray-500"></span>
        <span className="text-sm font-medium">Gas</span>
      </div>
      <div className="flex justify-center items-center gap-2.5">
        <Image
          src="/static/icons/fire.svg"
          width={12}
          height={16}
          alt="caret-down"
        />
        <span className="text-sm font-bold">Free</span>
        <span className="text-sm font-medium text-gray-700 line-through">
          $7.27
        </span>
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

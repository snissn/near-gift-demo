import Image from "next/image"

const Footer = () => {
  return (
    <footer className="w-full max-w-5xl py-6 bg-gray-50">
      <div className="w-full max-w-[552px] flex justify-center items-center text-sm text-secondary gap-1.5">
        <span>Powered by</span>
        <Image
          src="/static/icons/Aurora.svg"
          width={16}
          height={16}
          alt="Aurora logo"
        />
        <span className="text-black-400">Aurora</span>
      </div>
    </footer>
  )
}

export default Footer

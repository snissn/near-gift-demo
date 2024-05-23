import Image from "next/image"

const Footer = () => {
  return (
    <footer className="mx-auto my-10">
      <div className="flex justify-center items-center text-sm text-secondary gap-1.5">
        <span>Powered by</span>
        <Image src="/static/icons/Aurora.svg" width={20} height={20} />
        <span>Aurora</span>
      </div>
    </footer>
  )
}

export default Footer

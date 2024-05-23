import { PropsWithChildren } from "react"

interface Props extends PropsWithChildren {
  title?: string
}

const Paper = ({ children, title }: Props) => {
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <div className="min-w-[600px]">
        {title && <h1 className="mb-8">{title}</h1>}
        <div className="bg-gray-200 rounded-[40px] p-10">{children}</div>
      </div>
    </div>
  )
}

export default Paper

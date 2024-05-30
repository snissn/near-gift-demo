import { PropsWithChildren } from "react"

interface Props extends PropsWithChildren {
  title?: string
  description?: string
}

const Paper = ({ children, title, description }: Props) => {
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <div className="min-w-[600px]">
        <div className="flex flex-col mb-6">
          {title && <h1 className="mb-3">{title}</h1>}
          {description && (
            <span className="text-sm text-gray-600">{description}</span>
          )}
        </div>
        <div className="bg-gray-200 rounded-[40px] p-10">{children}</div>
      </div>
    </div>
  )
}

export default Paper

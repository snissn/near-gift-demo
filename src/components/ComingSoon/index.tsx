import clsx from "clsx"
import type { PropsWithChildren } from "react"

const WrapperComingSoon = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div className="opacity-80 cursor-not-allowed pointer-events-none">
      <LabelComingSoon className={clsx("top-1 right-5", className)} />
      {children}
    </div>
  )
}

export const LabelComingSoon = ({ className }: { className?: string }) => {
  return (
    <span
      className={clsx(
        "absolute -top-2 -right-3 text-[8px] text-nowrap text-primary",
        className && className
      )}
    >
      Coming Soon
    </span>
  )
}

export default WrapperComingSoon

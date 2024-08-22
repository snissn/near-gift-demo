import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { Dialog } from "@radix-ui/themes"

import { useModalStore } from "@src/providers/ModalStoreProvider"
import useScreenWidth from "@src/hooks/useScreenWidth"

const ModalDialog = ({ children }: PropsWithChildren) => {
  const { onCloseModal } = useModalStore((state) => state)
  const [open, setOpen] = useState(true)
  const containerWidthRef = useRef(0)
  const divRef = useRef<HTMLDivElement>(null)
  const screenWidth = useScreenWidth()

  const defaultMaxWidth = "512px"

  const handleCloseModal = useCallback(() => {
    if (!open) onCloseModal()
  }, [open, onCloseModal])

  useEffect(() => {
    handleCloseModal()
  }, [handleCloseModal])

  useEffect(() => {
    const offsetWidth = divRef.current?.offsetWidth
    if (offsetWidth) {
      containerWidthRef.current = divRef.current.offsetWidth
    }
    return () => {
      containerWidthRef.current = 0
    }
  }, [divRef.current?.offsetWidth])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Title></Dialog.Title>
      <Dialog.Content
        maxWidth={screenWidth < 768 ? "100%" : defaultMaxWidth}
        className="p-0 dark:bg-black-800"
      >
        <div ref={divRef}>{children}</div>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default ModalDialog

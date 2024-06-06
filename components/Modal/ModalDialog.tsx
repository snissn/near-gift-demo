import { PropsWithChildren, useCallback, useEffect, useState } from "react"
import { Dialog } from "@radix-ui/themes"

import { useModalStore } from "@/providers/ModalStoreProvider"

const ModalDialog = ({ children }: PropsWithChildren) => {
  const { onCloseModal } = useModalStore((state) => state)
  const [open, setOpen] = useState(true)

  const handleCloseModal = useCallback(() => {
    if (!open) onCloseModal()
  }, [open, onCloseModal])

  useEffect(() => {
    handleCloseModal()
  }, [handleCloseModal])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content maxWidth="512px" className="p-0">
        {children}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default ModalDialog

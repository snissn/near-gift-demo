import React, { PropsWithChildren, useCallback, useEffect } from "react"
import { Dialog } from "@radix-ui/themes"

import { useModalStore } from "@/providers/ModalStoreProvider"

const ModalDialog = ({ children }: PropsWithChildren) => {
  const { onCloseModal } = useModalStore((state) => state)
  const [open, setOpen] = React.useState(true)

  const handleCloseModal = useCallback(() => {
    if (!open) onCloseModal()
  }, [open, onCloseModal])

  useEffect(() => {
    handleCloseModal()
  }, [handleCloseModal])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content maxWidth="450px">{children}</Dialog.Content>
    </Dialog.Root>
  )
}

export default ModalDialog

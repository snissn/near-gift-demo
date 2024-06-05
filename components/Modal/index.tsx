"use client"

import { ModalType } from "../../stores/modalStore"
import { useModalStore } from "@/providers/ModalStoreProvider"

import ModalSelectAssets from "./ModalSelectAssets"

const Modal = () => {
  const { modalType } = useModalStore((state) => state)

  switch (modalType) {
    case ModalType.MODAL_SELECT_ASSETS:
      return <ModalSelectAssets />
  }
}

export default Modal

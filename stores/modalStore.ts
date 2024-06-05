"use client"

import { createStore } from "zustand/vanilla"

export enum ModalType {
  MODAL_SELECT_ASSETS = "modalSelectAssets",
}

export type ModalState = {
  modalType: ModalType | null
}

export type ModalActions = {
  setModalType: (modalType: ModalType | null, payload?: unknown) => void
  onCloseModal: () => void
}

export type ModalStore = ModalState & ModalActions

export const initModalStore = (): ModalState => {
  return { modalType: null }
}
export const defaultInitState: ModalState = {
  modalType: null,
}

export const createModalStore = (initState: ModalState = defaultInitState) => {
  return createStore<ModalStore>()((set) => ({
    ...initState,
    setModalType: (modalType: ModalType | null) =>
      set({ modalType: modalType }),
    onCloseModal: () => set({ modalType: null }),
  }))
}

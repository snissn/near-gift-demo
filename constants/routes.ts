export enum Navigation {
  SWAP = "/swap",
  DEPOSIT = "/deposit",
  SEND = "send",
}

export type NavigationLinks = {
  href: Navigation
  label: string
}

export const LINKS_HEADER: NavigationLinks[] = [
  { href: Navigation.SWAP, label: "Swap" },
  { href: Navigation.DEPOSIT, label: "Deposit" },
  { href: Navigation.SEND, label: "Send" },
]

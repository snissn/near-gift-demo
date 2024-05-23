export enum Navigation {
  SWAP = "/swap",
  DEPOSIT = "/deposit",
  WITHDRAW = "/withdraw",
}

export type NavigationLinks = {
  href: Navigation
  label: string
}

export const LINKS_HEADER: NavigationLinks[] = [
  { href: Navigation.SWAP, label: "Swap" },
  { href: Navigation.DEPOSIT, label: "Deposit" },
  { href: Navigation.WITHDRAW, label: "Withdraw" },
]

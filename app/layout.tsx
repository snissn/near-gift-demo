import { Theme } from "@radix-ui/themes"
import { ThemeProvider } from "next-themes"

import { WalletSelectorProvider } from "@/providers/WalletSelectorProvider"
import { ModalStoreProvider } from "@/providers/ModalStoreProvider"

import "@radix-ui/themes/styles.css"
import "@near-wallet-selector/modal-ui/styles.css"
import "@near-wallet-selector/account-export/styles.css"
import "../styles/global.scss"
import Modal from "@/components/Modal"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // CONTEXT: Could be used to share global concerns, theme
  //          like the current theme etc.
  return (
    <html lang="en">
      <body>
        <WalletSelectorProvider>
          <ThemeProvider attribute="class">
            <Theme>
              <ModalStoreProvider>
                {children}
                <Modal />
              </ModalStoreProvider>
            </Theme>
          </ThemeProvider>
        </WalletSelectorProvider>
      </body>
    </html>
  )
}

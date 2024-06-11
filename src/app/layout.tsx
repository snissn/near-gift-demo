import { Theme } from "@radix-ui/themes"
import { ThemeProvider } from "next-themes"

import { WalletSelectorProvider } from "@src/providers/WalletSelectorProvider"
import { HistoryStoreProvider } from "@src/providers/HistoryStoreProvider"
import { ModalStoreProvider } from "@src/providers/ModalStoreProvider"
import Modal from "@src/components/Modal"

import "@radix-ui/themes/styles.css"
import "@near-wallet-selector/modal-ui/styles.css"
import "@near-wallet-selector/account-export/styles.css"
import "../styles/global.scss"

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
              <HistoryStoreProvider>
                <ModalStoreProvider>
                  {children}
                  <Modal />
                </ModalStoreProvider>
              </HistoryStoreProvider>
            </Theme>
          </ThemeProvider>
        </WalletSelectorProvider>
      </body>
    </html>
  )
}

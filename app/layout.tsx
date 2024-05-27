import { Theme } from "@radix-ui/themes"
import { ThemeProvider } from "next-themes"

import "@radix-ui/themes/styles.css"
import "../styles/global.scss"
import { WalletSelectorProvider } from "@/providers/WalletSelectorProvider"

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
        <ThemeProvider attribute="class">
          <Theme>{children}</Theme>
        </ThemeProvider>
      </body>
    </html>
  )
}

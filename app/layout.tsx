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
      <body>{children}</body>
    </html>
  )
}

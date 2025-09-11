import { GoogleAnalytics } from "@next/third-parties/google"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

import { InitDefuseSDK } from "@src/components/InitDefuseSDK"
import { SentryTracer } from "@src/components/SentryTracer"
// Learning edition: static template without server-side flags
import { config as wagmiConfig } from "@src/config/wagmi"
import queryClient from "@src/constants/queryClient"
import { WebAuthnProvider } from "@src/features/webauthn/providers/WebAuthnProvider"
// Learning edition: only NEAR and WebAuthn providers kept
import { ThemeProvider } from "@src/providers/ThemeProvider"
import { WagmiProvider } from "wagmi"

import "@radix-ui/themes/styles.css"
import "../styles/global.scss"
import Helpscout from "@src/components/Helpscout"
import { MixpanelProvider } from "@src/providers/MixpanelProvider"
import { NearWalletProvider } from "@src/providers/NearWalletProvider"
import {
  APP_ENV,
  HELPSCOUT_BEACON_ID,
  VERCEL_PROJECT_PRODUCTION_URL,
} from "@src/utils/environment"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: VERCEL_PROJECT_PRODUCTION_URL,
  title: "NEAR Intents",
  description: "Learning edition of Defuse Frontend",
  icons: {
    icon: "/favicons/near-intents/favicon-32x32.png",
    apple: "/favicons/near-intents/apple-touch-icon.png",
  },
  manifest: "/favicons/near-intents/site.webmanifest",
}

const RootLayout = async ({
  children,
}: Readonly<{
  children?: ReactNode
}>) => {
  return (
    <html lang="en" suppressHydrationWarning className={"tmpl-near-intents"}>
      <body>
        <InitDefuseSDK />

        <ThemeProvider>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <NearWalletProvider>
                <WebAuthnProvider>
                  <MixpanelProvider>{children}</MixpanelProvider>
                </WebAuthnProvider>
                <SentryTracer />
              </NearWalletProvider>
              {APP_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </QueryClientProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-WNE3NB46KM" />
      {HELPSCOUT_BEACON_ID && <Helpscout />}
    </html>
  )
}

export default RootLayout

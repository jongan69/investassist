import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ViewTransitions } from "next-view-transitions"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/ui/theme-provider"
import Navigation from "@/components/ui/navigation"
import Footer from "@/components/ui/footer"
import WalletContextProvider from "@/components/contexts/WalletContextProvider"
import { Toaster } from 'react-hot-toast';
import ProfileForm from '@/components/profile/ProfileForm'
import Script from "next/script"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: "InvestAssist: Stock Quotes, Market News, & Analysis",
  description:
    "InvestAssist is a source of free stock quotes, business and finance news, portfolio management tools, and international market data.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <Script
          async
          defer
          strategy="lazyOnload"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6202902142885850"
          crossOrigin="anonymous"
        />
        <head>
          <meta
            name="description"
            content="InvestAssist is a source of free stock quotes, business and finance news, portfolio management tools, and international market data."
          />
          <link rel="icon" href="/favicon.ico" />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
        <body
          className={`${inter.className} min-h-screen bg-background pb-6 antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WalletContextProvider>
              <Navigation />
              <main className="container">{children}</main>
              <SpeedInsights />
              <ProfileForm />
              <Toaster />
              <Footer />
            </WalletContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}

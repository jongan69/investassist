import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ViewTransitions } from "next-view-transitions"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/ui/theme-provider"
import Navigation from "@/components/ui/navigation"
import Footer from "@/components/ui/footer"
import WalletContextProvider from "@/components/contexts/WalletContextProvider"
import { Toaster } from 'sonner';
import ProfileForm from '@/components/profile/ProfileForm'
import { Analytics } from '@vercel/analytics/next';
import { getTokenPrice } from "@/lib/solana/fetchTokenPirce";
// import Script from "next/script"

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
})

export async function generateMetadata(): Promise<Metadata> {
  const priceData = await getTokenPrice();
  return {
    title: `InvestAssist - $IA: ${priceData.price}`,
    description:
      "InvestAssist is a source of free stock and crypto quotes, business and finance news, portfolio management tools, and global market data.",
  }
}

export const revalidate = 300 // Revalidate every 5 minutes

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6202902142885850"
          crossOrigin="anonymous"
        />
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
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
              <main className="container">
                {children}
                <SpeedInsights />
                <Analytics />
              </main>
              <ProfileForm />
              <Toaster position="top-right" />
              <Footer />
            </WalletContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}

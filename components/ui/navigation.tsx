"use client"
import { ThemeToggle } from "./theme-toggle"
import {
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import GoBack from "./go-back"
import { usePathname } from "next/navigation"

import CommandMenu from "./command-menu"
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import '../../styles/navbar-styles.css'
// Dynamically import WalletMultiButton with no SSR
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

const NAVIGATION = [
  { title: "Markets", href: "/" },
  { title: "Screener", href: "/screener" },
  { title: "About", href: "/about" },
]

export default function Navigation() {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center gap-2 md:gap-6 px-2 md:px-4 min-w-0">
            <button
              className="block md:hidden flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              data-state={isMenuOpen ? "open" : "closed"}
            >
              <span className="hamburger-icon"></span>
            </button>
            
            <div className="flex-shrink-0">
              {pathname !== "/" && <GoBack />}
            </div>
            <div className="hidden md:flex items-center space-x-4 overflow-x-auto">
              {NAVIGATION.map((item) => (
                <Link 
                  key={item.title} 
                  href={item.href}
                  className={`${navigationMenuTriggerStyle()} whitespace-nowrap`}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <div className="hidden sm:flex flex-row gap-2">
              <CommandMenu />
              <ThemeToggle/>
            </div>
            <WalletMultiButton
              className={`!rounded-lg !px-3 md:!px-6 transition-all duration-200 ${
                resolvedTheme === 'dark' ? '!bg-black text-white' : '!bg-white text-black'
              } hover:!bg-helius-orange`}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <Collapsible.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <Collapsible.Content className="md:hidden collapsible-content">
            <nav className="flex flex-col space-y-4 py-4">
              {NAVIGATION.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={navigationMenuTriggerStyle()}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              <div className="sm:hidden px-4 flex items-center gap-4">
                <CommandMenu />
                <ThemeToggle/>
              </div>
            </nav>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </header>
  )
}

"use client"
import { ThemeToggle } from "./theme-toggle"
// import {
//   navigationMenuTriggerStyle,
// } from "@/components/ui/navigation-menu"
import Link from "next/link"
// import GoBack from "./go-back"
import { usePathname } from "next/navigation"

import CommandMenu from "./command-menu"
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import '../../styles/navbar-styles.css'
import { useWallet } from "@solana/wallet-adapter-react"
import { getProfileByWalletAddress } from "@/lib/users/getProfileByWallet"
import { Button } from "@/components/ui/button"

// Dynamically import WalletMultiButton with no SSR
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

const NAVIGATION = [
  { title: "Markets", href: "/" },
  { title: "Screener", href: "/screener" },
  { title: "About", href: "/about" },
  { title: "Learn", href: "/learn" }
]

export default function Navigation() {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { publicKey } = useWallet();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getUsername = async () => {
      if (!publicKey) {
        setUsername('');
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getProfileByWalletAddress(publicKey);
        if (isMounted) {
          if (profile.exists) {
            setUsername(profile.profile.username);
          } else {
            setUsername('');
          }
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        if (isMounted) {
          setUsername('');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getUsername();

    return () => {
      isMounted = false;
    };
  }, [publicKey]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-sm md:text-base">InvestAssist</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === item.href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block">
            <CommandMenu />
          </div>
          <ThemeToggle />
          <div className="hidden sm:block">
            <WalletMultiButton className="wallet-adapter-button" />
          </div>
          {publicKey && (
            <Link href={`/users/${publicKey.toString()}`} className="hidden sm:block">
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </Link>
          )}
          
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Toggle Menu</span>
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        <Collapsible.Root
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          className="absolute left-0 top-14 w-full bg-white/95 dark:bg-[#121212]/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#121212]/70 md:hidden"
        >
          <Collapsible.Content className="border-b">
            <div className="container py-2">
              <div className="space-y-1">
                {NAVIGATION.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2 px-4 text-sm rounded-md ${
                      pathname === item.href 
                        ? "bg-accent text-accent-foreground" 
                        : "text-foreground/60 hover:bg-accent/50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
                <div className="px-4 py-2">
                  <CommandMenu />
                </div>
                <div className="px-4 py-2 sm:hidden">
                  <WalletMultiButton className="wallet-adapter-button w-full" />
                </div>
                {publicKey && (
                  <div className="px-4 py-2 sm:hidden">
                    <Link href={`/users/${publicKey.toString()}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </nav>
  )
}

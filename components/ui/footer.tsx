"use client"

import Link from "next/link"
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react';
import Image from "next/image";

// SVG Icons as React components
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    className="fill-current w-5 h-5 mr-2 translate-y-[8px] md:translate-y-0"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    className="fill-current w-5 h-5 mr-2"
    aria-hidden="true"
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const PumpIcon = () => (
  <Image
    src="/pump.svg"
    width={20}
    height={20}
    alt="Pump.fun"
    className="w-5 h-5 mr-2"
    priority={false}
    // placeholder="blur"
    // blurDataURL="/pump.svg"
  />
)

export default function Footer() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner, or a default theme
  }

  return (
    <footer className={`container py-8 md:px-10 md:py-4 ${resolvedTheme === 'dark' ? 'bg-black-800' : 'bg-gray-100'}`}>
      <div className="flex items-center justify-center space-y-4 md:space-y-0 md:space-x-8 md:flex-row">
        <Link
          prefetch={false}
          href="https://x.com/invest_assist"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit InvestAssist on X"
          className={`font-semibold text-sm ${resolvedTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors duration-200 flex items-center`}
        >
          <div className="h-5 flex items-center">
            <XIcon />
          </div>
        </Link>
        <Link
          prefetch={false}
          href="https://t.me/InvestAssistApp"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit Bandz Capital"
          className={`font-semibold ${resolvedTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors duration-200 flex items-center`}
        >
          <div className="h-5 flex items-center">
            <TelegramIcon />
          </div>
        </Link>
        <Link
          href="https://pump.fun/coin/8KxEiudmUF5tpJKK4uHzjDuJPGKUz9hYUDBEVcfdpump"
          target="_blank"
          rel="noreferrer"
          className="hover:opacity-70 transition-opacity flex items-center"
          aria-label="Pump.fun"
        >
          <div className="h-5 flex items-center">
            <PumpIcon />
          </div>
        </Link>
      </div>
    </footer>
  )
}

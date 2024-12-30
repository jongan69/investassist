"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="container py-6 md:px-8 md:py-0">
      <div className="flex flex-col items-end justify-between md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          By {" "}
          <Link
            prefetch={false}
            href="https://twitter.com/jongan69"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Jonathan Gan
          </Link>
          . View my other projects at{" "}
          <Link
            prefetch={false}
            href="https://jongan.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Here
          </Link>
          .
        </p>
      </div>
    </footer>
  )
}

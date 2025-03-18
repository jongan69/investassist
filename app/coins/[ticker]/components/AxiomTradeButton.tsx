'use client'

import { Button } from "@/components/ui/button"

interface AxiomTradeButtonProps {
  axiomLink: string
}

export default function AxiomTradeButton({ axiomLink }: AxiomTradeButtonProps) {
  if (!axiomLink) return null

  return (
    <Button
      variant="outline"
      className="ml-4"
      onClick={() => window.open(axiomLink, '_blank')}
    >
      Trade on Axiom
    </Button>
  )
} 
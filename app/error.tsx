'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button
        onClick={reset}
        variant="outline"
        className="mt-4"
      >
        Try again
      </Button>
      <Button
        onClick={() => window.location.href = '/'}
        className="mt-2"
      >
        Go to home page
      </Button>
    </div>
  )
} 
"use client"

import { useEffect, useState } from "react"
import { EmailSignupDialog } from "@/components/ui/email-signup-dialog"
import { toast } from "sonner"

export function EmailSignupPrompt() {
  const [showDialog, setShowDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem("hasSeenEmailSignup")
    
    if (!hasSeenPopup) {
      // Random delay between 60-120 seconds (1-2 minutes)
      const delay = Math.floor(Math.random() * (120000 - 60000) + 60000)
      
      const timer = setTimeout(() => {
        setShowDialog(true)
        // Mark that the user has seen the popup
        localStorage.setItem("hasSeenEmailSignup", "true")
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSignup = async (email: string) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }
      
      toast.success("Thank you for signing up! Check your email for confirmation.")
      setShowDialog(false)
    } catch (error) {
      console.error("Email signup failed:", error)
      toast.error("Failed to sign up. Please try again later.")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showDialog) return null

  return (
    <EmailSignupDialog 
      onSignup={handleSignup}
    />
  )
} 
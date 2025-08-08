"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      // Check if there's a redirect URL stored in sessionStorage
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin')
        
        // Also restore any saved application state
        const savedState = sessionStorage.getItem('appStateBeforeLogin')
        if (savedState) {
          // Parse and set to global state or dispatch to parent component
          const stateData = JSON.parse(savedState)
          // We'll handle state restoration in the create page
          sessionStorage.removeItem('appStateBeforeLogin')
        }
        
        router.push(redirectUrl)
      }
    }
  }, [isSignedIn, router])

  return <>{children}</>
}
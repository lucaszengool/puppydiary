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
        router.push(redirectUrl)
      }
    }
  }, [isSignedIn, router])

  return <>{children}</>
}
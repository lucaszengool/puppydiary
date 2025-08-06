"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-popmart-pink/10 via-popmart-blue/10 to-popmart-yellow/10">
      <div className="text-center space-y-6 p-8 bg-white/80 backdrop-blur rounded-2xl popmart-shadow max-w-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h2>
          <p className="text-gray-600">
            We encountered an error while processing your request. Please try again.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="popmart">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-popmart-pink/10 via-popmart-blue/10 to-popmart-yellow/10">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-popmart-pink" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { Dog, Heart } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen sky-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
          <div className="relative">
            <Dog className="h-12 w-12 text-forest-dark animate-gentle-float" />
            <Heart className="h-5 w-5 text-rose absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <span className="text-3xl font-bold text-forest-dark handwriting">
              小狗日记
            </span>
          </div>
        </Link>
        
        <div className="ghibli-card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-forest-dark handwriting mb-2">开始记录</h1>
            <p className="text-forest">创建账号，为您的狗狗建立专属相册</p>
          </div>
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-forest hover:bg-forest-dark rounded-full",
                footerActionLink: "text-forest hover:text-forest-dark",
                formFieldInput: "rounded-full border-forest-light focus:border-forest",
                socialButtonsBlockButton: "rounded-full border-2 hover:bg-forest-light",
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
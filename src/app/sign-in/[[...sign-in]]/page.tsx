import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { Dog, Heart } from "lucide-react"
import WechatLoginButton from "@/components/WechatLoginButton"
import AuthRedirect from "@/components/AuthRedirect"

export default function Page() {
  return (
    <AuthRedirect>
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
              Petpo
            </span>
          </div>
        </Link>
        
        <div className="ghibli-card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-forest-dark handwriting mb-2">欢迎回来</h1>
            <p className="text-forest">登录您的账号，继续记录美好时光</p>
          </div>
          
          {/* WeChat Login Button */}
          <div className="mb-6">
            <WechatLoginButton />
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">或</span>
            </div>
          </div>
          
          <SignIn 
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
    </AuthRedirect>
  )
}
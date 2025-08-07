"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { MessageCircle } from "lucide-react"

export default function WechatLoginButton() {
  const [loading, setLoading] = useState(false)

  const handleWechatLogin = async () => {
    setLoading(true)
    
    try {
      // Check if WeChat credentials are configured
      if (!process.env.NEXT_PUBLIC_WECHAT_CLIENT_ID) {
        alert("微信登录申请中，请各位小伙伴暂时使用其他方式登录")
        return
      }

      // Use NextAuth to sign in with WeChat
      await signIn("wechat", { 
        callbackUrl: "/dashboard",
        redirect: true 
      })
      
    } catch (error) {
      console.error("WeChat login error:", error)
      alert("微信登录失败，请稍后重试或联系技术支持")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleWechatLogin}
      disabled={loading}
      className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <MessageCircle className="w-5 h-5 text-green-600" />
      <span className="text-sm font-medium text-gray-700">
        {loading ? "连接中..." : "使用微信登录"}
      </span>
    </button>
  )
}
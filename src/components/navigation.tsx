"use client"

import { UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { Camera, BookOpen, LogIn, PawPrint } from "lucide-react"

export function Navigation() {
  const { userId } = useAuth()
  
  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-neutral-900">
                Petpo
              </span>
              <div className="text-xs text-neutral-500">AI宠物漫画</div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            {userId && (
              <Link 
                href="/gallery" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">我的相册</span>
              </Link>
            )}
            <Link 
              href="/create" 
              className="premium-button flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>开始创作</span>
            </Link>
            {userId ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link href="/sign-in">
                <button className="premium-button-secondary flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>登录</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
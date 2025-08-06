"use client"

import { UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { Camera, Heart, BookOpen, LogIn, Dog } from "lucide-react"

export function Navigation() {
  const { userId } = useAuth()
  
  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b-4 border-forest-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Dog className="h-10 w-10 text-forest-dark animate-gentle-float" />
              <Heart className="h-4 w-4 text-rose absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-bold text-forest-dark handwriting">
                小狗日记
              </span>
              <div className="text-xs text-forest opacity-70">Puppy Diary</div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {userId && (
              <Link 
                href="/gallery" 
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-sand/50 hover:bg-sand transition-all duration-300 hand-drawn-border-light"
              >
                <BookOpen className="h-4 w-4 text-forest-dark" />
                <span className="text-forest-dark font-medium">我的相册</span>
              </Link>
            )}
            <Link 
              href="/create" 
              className="ghibli-button flex items-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span className="font-medium">记录时光</span>
            </Link>
            {userId ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link href="/sign-in">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-full border-2 border-forest hover:bg-forest-light transition-all duration-300">
                  <LogIn className="h-4 w-4 text-forest-dark" />
                  <span className="text-forest-dark">登录</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
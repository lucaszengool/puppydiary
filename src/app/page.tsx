import { currentUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { Camera, Sparkles, Heart, PawPrint, Palette } from "lucide-react"

export default async function Home() {
  const user = await currentUser()

  return (
    <div className="min-h-screen premium-bg">
      {/* 漂浮的宠物元素 */}
      <div className="floating-pets">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={`pet-${i}`}
            className="floating-heart" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            🐾
          </div>
        ))}
      </div>
      
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8 fade-in">
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <PawPrint className="h-16 w-16 text-neutral-900 subtle-float" />
                <Heart className="h-6 w-6 text-red-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 tracking-tight">
              AI宠物漫画工作室
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              专业级宠物影像创作平台，将您的爱宠照片转化为高质量漫画作品
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <button className="premium-button text-lg px-8 py-4 flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>开始创作</span>
              </button>
            </Link>
            {!user && (
              <Link href="/sign-in">
                <button className="premium-button-secondary text-lg px-8 py-4">
                  登录账号
                </button>
              </Link>
            )}
          </div>
        </div>


        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="premium-card text-center space-y-4 fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800">智能识别</h3>
            <p className="text-neutral-600">
              AI自动识别宠物特征，确保每个细节都完美保留
            </p>
          </div>

          <div className="premium-card text-center space-y-4 fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800">艺术转换</h3>
            <p className="text-neutral-600">
              多种艺术风格可选，从水彩到油画，打造独特视觉效果
            </p>
          </div>

          <div className="premium-card text-center space-y-4 fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800">专业品质</h3>
            <p className="text-neutral-600">
              高分辨率输出，支持打印级品质，永久保存美好回忆
            </p>
          </div>
        </div>

        {/* 简洁的底部标语 */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center space-x-4 text-neutral-500">
            <PawPrint className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">PROFESSIONAL PET PORTRAIT STUDIO</span>
            <PawPrint className="w-4 h-4" />
          </div>
        </div>
      </main>
    </div>
  )
}
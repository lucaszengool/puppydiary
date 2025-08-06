import { currentUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { Camera, Sparkles, Heart, PawPrint, Palette, BookOpen } from "lucide-react"

export default async function Home() {
  const user = await currentUser()

  return (
    <div className="min-h-screen sky-gradient">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 云朵装饰 */}
        <div className="fixed top-20 left-10 cloud w-20 h-10 animate-float opacity-40"></div>
        <div className="fixed top-32 right-20 cloud w-16 h-8 animate-float opacity-30" style={{ animationDelay: '2s' }}></div>
        
        <div className="text-center space-y-8 page-transition">
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <PawPrint className="h-16 w-16 text-forest animate-gentle-float" />
                <Heart className="h-6 w-6 text-rose absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-forest-dark handwriting animate-gentle-float">
              记录毛孩子的每一天
            </h1>
            <p className="text-xl text-forest max-w-2xl mx-auto leading-relaxed">
              用宫崎骏风格的手绘漫画，为您的爱犬创作独一无二的成长日记。
              每一张照片都是一段美好的回忆，每一幅画作都是爱的见证。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <button className="ghibli-button text-lg px-8 py-4 flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>开始记录</span>
              </button>
            </Link>
            {!user && (
              <Link href="/sign-in">
                <button className="px-8 py-4 rounded-full border-2 border-forest bg-white/50 hover:bg-white transition-all text-forest-dark text-lg hand-drawn-border-light">
                  登录账号
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="ghibli-card text-center space-y-4 animate-float" style={{ animationDelay: '0s' }}>
            <div className="w-16 h-16 mx-auto rounded-full forest-gradient flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-forest-dark handwriting">拍照记录</h3>
            <p className="text-forest-deep">
              随时随地拍下狗狗的可爱瞬间，或上传已有的珍贵照片
            </p>
          </div>

          <div className="ghibli-card text-center space-y-4 animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 mx-auto rounded-full forest-gradient flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-forest-dark handwriting">AI魔法创作</h3>
            <p className="text-forest-deep">
              智能AI将照片转化为温暖治愈的宫崎骏风格手绘漫画
            </p>
          </div>

          <div className="ghibli-card text-center space-y-4 animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-16 h-16 mx-auto rounded-full forest-gradient flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-forest-dark handwriting">珍藏回忆</h3>
            <p className="text-forest-deep">
              创建专属相册，记录狗狗成长的点点滴滴，永久保存美好时光
            </p>
          </div>
        </div>

        {/* 装饰元素 */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center space-x-4 text-forest">
            <div className="leaf"></div>
            <span className="handwriting text-lg">让每一个瞬间都成为永恒</span>
            <div className="leaf" style={{ transform: 'rotate(135deg)' }}></div>
          </div>
        </div>
      </main>
    </div>
  )
}
import { currentUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import Image from "next/image"
import { Camera, Plus, Grid, User } from "lucide-react"

export default async function Home() {
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-white">
      {/* VSCO Style Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-light tracking-wide text-black">
            PETPO
          </Link>
          <nav className="flex space-x-4 md:space-x-6">
            <Link href="/create" className="text-sm md:text-sm font-medium text-gray-600 hover:text-black transition-colors">
              创作
            </Link>
            <Link href="/gallery" className="text-sm md:text-sm font-medium text-gray-600 hover:text-black transition-colors">
              作品集
            </Link>
            {user ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            ) : (
              <Link href="/sign-in" className="text-sm md:text-sm font-medium text-gray-600 hover:text-black transition-colors">
                登录
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="pt-16 pb-24 text-center">
          <h1 className="text-4xl md:text-6xl font-light text-black mb-6 tracking-tight">
            AI 宠物肖像
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            用专业级艺术风格重新诠释您的爱宠，每一个细节都被完美保留
          </p>
          
          <Link href="/create" className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>开始创作</span>
          </Link>
        </div>

        {/* Style Grid */}
        <div className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-2">

            {/* Ghibli Style */}
            <Link href="/create?style=ghibli" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/ghibli-style.png"
                alt="宫崎骏动漫"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  宫崎骏动漫
                </div>
              </div>
            </Link>

            {/* Watercolor Style */}
            <Link href="/create?style=watercolor" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/watercolor-style.png"
                alt="水彩插画"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  水彩插画
                </div>
              </div>
            </Link>

            {/* Modern Style */}
            <Link href="/create?style=modern" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/modern-style.png"
                alt="现代简约"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  现代简约
                </div>
              </div>
            </Link>

            {/* Disney Style */}
            <Link href="/create?style=disney" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/disney-cartoon.png"
                alt="迪士尼卡通"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  迪士尼卡通
                </div>
              </div>
            </Link>

            {/* Vintage Style */}
            <Link href="/create?style=vintage" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/vintage-style.png"
                alt="复古怀旧"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  复古怀旧
                </div>
              </div>
            </Link>


            {/* Pencil Sketch Style */}
            <Link href="/create?style=pencil" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/pencil-style.png"
                alt="铅笔素描"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  铅笔素描
                </div>
              </div>
            </Link>


            {/* Cyberpunk Style */}
            <Link href="/create?style=cyberpunk" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/cyberpunk-style.png"
                alt="赛博朋克"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  赛博朋克
                </div>
              </div>
            </Link>

            {/* Renaissance Style */}
            <Link href="/create?style=renaissance" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/renaissance-style.png"
                alt="文艺复兴"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  文艺复兴
                </div>
              </div>
            </Link>

            {/* Mosaic Style */}
            <Link href="/create?style=mosaic" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/mosaic-style.png"
                alt="马赛克艺术"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  马赛克艺术
                </div>
              </div>
            </Link>

            {/* Monet Impressionist Style */}
            <Link href="/create?style=monet" className="group relative aspect-square overflow-hidden bg-gray-50">
              <Image
                src="/styles/monet-style.png"
                alt="莫奈印象派"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-black">
                  莫奈印象派
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-16 text-center">
          <p className="text-sm text-gray-400 font-light tracking-wide">
            PETPO - PROFESSIONAL PET PORTRAIT STUDIO
          </p>
        </footer>
      </main>
    </div>
  )
}
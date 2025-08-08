import Link from 'next/link'
import { Heart, Dog, Sparkles, ArrowRight } from 'lucide-react'

async function getSharedImage(shareId: string) {
  try {
    const { getSharedImage } = await import('@/lib/bones')
    return await getSharedImage(shareId)
  } catch (error) {
    console.error('Failed to load bones lib:', error)
    return null
  }
}

interface SharePageProps {
  params: {
    shareId: string
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const sharedImage = await getSharedImage(params.shareId)

  if (!sharedImage) {
    return (
      <div className="min-h-screen sky-gradient flex items-center justify-center p-4">
        <div className="text-center ghibli-card max-w-md">
          <Dog className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-600 mb-2">作品未找到</h1>
          <p className="text-gray-500 mb-6">这个分享链接可能已过期或不存在</p>
          <Link 
            href="/create" 
            className="inline-flex items-center px-6 py-3 bg-forest text-white rounded-full hover:bg-forest-dark transition-colors"
          >
            制作我的宠物肖像 <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen sky-gradient">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Dog className="h-8 w-8 text-forest-dark" />
            <span className="text-xl font-bold text-forest-dark handwriting">Petpo</span>
          </Link>
          <Link 
            href="/create"
            className="flex items-center px-4 py-2 bg-forest text-white rounded-full hover:bg-forest-dark transition-colors text-sm"
          >
            制作我的专属肖像 <Sparkles className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="ghibli-card">
          {/* Image Display */}
          <div className="aspect-square max-w-lg mx-auto mb-6 rounded-xl overflow-hidden shadow-lg">
            <img 
              src={sharedImage.image_url} 
              alt={sharedImage.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Info */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-forest-dark mb-2 handwriting">
              {sharedImage.title}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                {sharedImage.style}
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {sharedImage.view_count} 次观看
              </span>
            </div>
            {sharedImage.description && (
              <p className="text-gray-700 max-w-md mx-auto">
                {sharedImage.description}
              </p>
            )}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-forest-light/20 to-rose/20 rounded-xl p-6 text-center">
            <Dog className="h-12 w-12 text-forest-dark mx-auto mb-4 animate-gentle-float" />
            <h2 className="text-xl font-bold text-forest-dark mb-2 handwriting">
              想要制作专属于你的宠物肖像？
            </h2>
            <p className="text-gray-600 mb-6">
              使用AI技术，将你的宠物照片转化为精美的艺术作品
            </p>
            <Link 
              href="/create"
              className="inline-flex items-center px-8 py-4 bg-forest text-white rounded-full hover:bg-forest-dark transition-all transform hover:scale-105 shadow-lg text-lg font-medium"
            >
              开始制作我的肖像 <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-forest-light rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-forest-dark" />
              </div>
              <h3 className="font-semibold text-forest-dark mb-1">多种风格</h3>
              <p className="text-sm text-gray-600">水彩、油画、现代简约等多种艺术风格</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-rose/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-rose" />
              </div>
              <h3 className="font-semibold text-forest-dark mb-1">AI技术</h3>
              <p className="text-sm text-gray-600">先进的AI算法，打造独一无二的艺术品</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Dog className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-forest-dark mb-1">个性化</h3>
              <p className="text-sm text-gray-600">专为你的宠物量身定制的艺术肖像</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
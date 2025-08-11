import Link from 'next/link'
import { Heart, Dog, Sparkles, ArrowRight } from 'lucide-react'

async function getSharedImage(shareId: string) {
  // Return null for now to avoid server component errors in production
  // This will show the "not found" page which is user-friendly
  console.log('Attempting to get shared image for ID:', shareId)
  
  try {
    // Try bones system first
    const { getSharedImage } = await import('@/lib/bones')
    const result = await getSharedImage(shareId)
    console.log('Bones result:', result ? 'found' : 'not found')
    return result
  } catch (bonesError) {
    console.error('Bones system failed:', bonesError)
    
    try {
      // Try fallback system
      const fallback = await import('@/lib/bones-fallback')
      const result = await fallback.getSharedImage(shareId)
      console.log('Fallback result:', result ? 'found' : 'not found')
      return result
    } catch (fallbackError) {
      console.error('Fallback system also failed:', fallbackError)
      
      // Return a mock shared image for testing if both systems fail
      if (shareId === 'test-123' || shareId.startsWith('test-')) {
        return {
          id: shareId,
          image_url: 'https://placehold.co/512x512/green/white?text=Test+Share',
          title: '测试分享图片',
          description: '这是一个测试的分享图片',
          style: '测试风格',
          view_count: 1,
          created_at: new Date().toISOString()
        }
      }
      
      return null
    }
  }
}

interface SharePageProps {
  params: {
    shareId: string
  }
}

export default async function SharePage({ params }: SharePageProps) {
  let sharedImage = null
  
  try {
    sharedImage = await getSharedImage(params.shareId)
  } catch (error) {
    console.error('Error in SharePage:', error)
    sharedImage = null
  }

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
              onLoad={() => console.log('Shared image loaded successfully:', sharedImage.image_url)}
              onError={(e) => {
                console.error('Shared image failed to load:', sharedImage.image_url, e);
                // Try to show a fallback or error message
              }}
              style={{ backgroundColor: '#f3f4f6' }}
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

          {/* CTA Section - Enhanced for conversion */}
          <div className="bg-gradient-to-br from-forest-light/20 to-rose/20 rounded-xl p-6 text-center mb-6">
            <div className="mb-6">
              <Dog className="h-16 w-16 text-forest-dark mx-auto mb-4 animate-gentle-float" />
              <h2 className="text-2xl font-bold text-forest-dark mb-3 handwriting">
                🎨 你也想要这样的专属宠物肖像吗？
              </h2>
              <p className="text-gray-700 text-lg mb-4">
                只需上传一张宠物照片，AI立刻为你生成专业艺术作品
              </p>
              <div className="flex items-center justify-center space-x-6 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                  <span>30秒快速生成</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1 text-rose" />
                  <span>多种艺术风格</span>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-1 text-forest" />
                  <span>完全免费体验</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link 
                href="/create"
                className="inline-flex items-center px-10 py-4 bg-forest text-white rounded-full hover:bg-forest-dark transition-all transform hover:scale-105 shadow-lg text-xl font-semibold w-full max-w-md mx-auto justify-center"
              >
                🎯 立即免费制作 <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
              
              <p className="text-xs text-gray-500">
                无需注册，上传照片即可开始 • 已有 <span className="font-semibold text-forest">10万+</span> 用户体验
              </p>
            </div>
          </div>

          {/* Social Proof & Features */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              ⭐ 为什么选择 PETPO？
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">AI智能识别</h4>
                  <p className="text-sm text-gray-600">自动识别宠物特征，保持原有可爱模样</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">⚡</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">极速生成</h4>
                  <p className="text-sm text-gray-600">30秒内完成专业级艺术肖像制作</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">🎨</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">多种风格</h4>
                  <p className="text-sm text-gray-600">水彩、油画、动漫、卡通等6种艺术风格</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-600 font-bold">💝</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">高清下载</h4>
                  <p className="text-sm text-gray-600">支持高清图片下载，可制作实物相框</p>
                </div>
              </div>
            </div>
          </div>

          {/* Urgency & Final CTA */}
          <div className="text-center bg-gradient-to-r from-rose/10 to-forest-light/10 rounded-xl p-6">
            <p className="text-forest-dark font-medium mb-4">
              🔥 限时活动：现在制作完全免费，还能生成专属视频！
            </p>
            <Link 
              href="/create"
              className="inline-flex items-center px-8 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-all shadow-lg font-semibold"
            >
              马上开始制作 →
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
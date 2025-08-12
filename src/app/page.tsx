import { currentUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Heart, Camera } from "lucide-react"

export default async function Home() {
  const user = await currentUser()

  const styles = [
    { id: 'ghibli', name: '宫崎骏动漫', image: '/styles/ghibli-style.png', description: '温暖治愈的手绘风格' },
    { id: 'watercolor', name: '水彩插画', image: '/styles/watercolor-style.png', description: '柔美的水彩艺术风格' },
    { id: 'modern', name: '现代简约', image: '/styles/modern-style.png', description: '简约现代的艺术风格' },
    { id: 'disney', name: '迪士尼卡通', image: '/disney cartoon.png', description: '可爱生动的卡通风格' },
    { id: 'vintage', name: '复古怀旧', image: '/styles/vintage-style.png', description: '温暖的复古摄影风格' },
    { id: 'pencil', name: '铅笔素描', image: '/styles/pencil-style.png', description: '精细逼真的素描风格' },
    { id: 'cyberpunk', name: '赛博朋克', image: '/styles/cyberpunk-style.png', description: '未来科技霓虹风格' },
    { id: 'renaissance', name: '文艺复兴', image: '/styles/renaissance-style.png', description: '古典贵族肖像风格' },
    { id: 'mosaic', name: '马赛克艺术', image: '/styles/mosaic-style.png', description: '彩色玻璃镶嵌风格' },
    { id: 'monet', name: '莫奈印象派', image: '/styles/monet-style.png', description: '莫奈睡莲般的梦幻风格' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-extralight tracking-[0.2em] text-gray-900">
              PETPO
            </Link>
            
            <div className="flex items-center space-x-8">
              <Link href="/gallery" className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors tracking-wide">
                画廊
              </Link>
              <Link href="/create" className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors tracking-wide">
                创作
              </Link>
              {user ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                </div>
              ) : (
                <Link href="/sign-in" className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors tracking-wide">
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-extralight text-gray-900 mb-8 tracking-tight leading-none">
              Petpo 宠物
              <span className="block text-gray-600">肖像画</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-light text-gray-600 mb-16 leading-relaxed max-w-2xl mx-auto">
              用先进视觉模型，保留宠物原有特征，将您心爱的宠物变成惊艳的艺术作品
            </p>

            <Link 
              href="/create"
              className="inline-flex items-center space-x-3 bg-gray-900 text-white px-8 py-4 text-sm font-light tracking-wide hover:bg-gray-800 transition-all duration-300 group"
            >
              <span>开始创作</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 leading-tight">
                专业
                <span className="block text-gray-600">品质</span>
              </h2>
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                使用先进的 AI 算法保留并增强您宠物的每一个细节，
                创造出值得收藏的肖像画，完美捕捉它们独特的个性。
              </p>
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-light">情感保留</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-light">AI 增强</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-sm overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src="/styles/ghibli-style.png"
                  alt="Featured artwork"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-sm overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src="/styles/watercolor-style.png"
                  alt="Secondary artwork"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-6">
              多种用途
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              您的宠物艺术作品可以用于多种场景，让美好无处不在
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            {/* iPhone Wallpaper */}
            <div className="text-center space-y-6 flex flex-col">
              <div className="relative mx-auto w-48 h-96 bg-black rounded-[2.5rem] p-2 shadow-2xl flex-shrink-0">
                {/* iPhone Frame */}
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>
                  {/* Wallpaper */}
                  <Image
                    src="/styles/ghibli-style.png"
                    alt="iPhone壁纸示例"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                  {/* Time */}
                  <div className="absolute top-3 left-6 z-20">
                    <span className="text-white text-sm font-semibold drop-shadow-md">9:41</span>
                  </div>
                  {/* Battery/Signal */}
                  <div className="absolute top-3 right-6 z-20">
                    <div className="w-6 h-3 border border-white rounded-sm">
                      <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
                    </div>
                  </div>
                  {/* Lock Screen Elements */}
                  <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center z-20">
                    <div className="text-white text-4xl font-extralight mb-2 drop-shadow-md">周四</div>
                    <div className="text-white text-lg font-light drop-shadow-md">12月25日</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-start">
                <h3 className="text-xl font-light text-gray-900 mb-4">手机壁纸</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  制作个性化的手机锁屏和主屏壁纸，让爱宠时刻陪伴您
                </p>
              </div>
            </div>

            {/* Custom Clothing - Disabled */}
            <div className="text-center space-y-6 flex flex-col cursor-not-allowed opacity-75">
              <div className="relative mx-auto flex-shrink-0" style={{ height: '384px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Hoodie Mockup with Background Image */}
                <div className="w-48 h-60 relative overflow-hidden rounded-lg shadow-xl">
                  <Image
                    src="/卫衣/926e055aa81bcd7681beffbcd82d2dd5.jpg"
                    alt="定制衣服示例"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-start">
                <h3 className="text-xl font-light text-gray-900 mb-4">定制衣服</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  将您的宠物肖像印制在高品质服装上，打造专属时尚单品
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center space-y-6 flex flex-col">
              <div className="relative mx-auto flex-shrink-0" style={{ height: '384px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Instagram Post Mockup */}
                <div className="w-48 h-60 bg-white shadow-xl rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center p-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center mr-3">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">我的小可爱</span>
                  </div>
                  {/* Image */}
                  <div className="relative h-36">
                    <Image
                      src="/styles/modern-style.png"
                      alt="社交媒体示例"
                      fill
                      sizes="192px"
                      className="object-cover"
                    />
                  </div>
                  {/* Actions */}
                  <div className="p-3">
                    <div className="flex space-x-4 mb-2">
                      <Heart className="w-5 h-5 text-gray-600" />
                      <span className="text-xs text-gray-600">128 个赞</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-start">
                <h3 className="text-xl font-light text-gray-900 mb-4">社交分享</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  在社交媒体上展示您的宠物艺术作品，收获更多关注和赞美
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-6">
              艺术风格
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              从我们的精选艺术风格集合中选择，
              每一种都精心设计来突出您宠物的天然美
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {styles.map((style, index) => (
              <Link 
                key={style.id}
                href={`/create?style=${style.id}`}
                className="group relative aspect-square overflow-hidden rounded-sm bg-gray-100 hover:shadow-xl transition-all duration-500"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <Image
                  src={style.image}
                  alt={style.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Style Name */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-sm font-light tracking-wide">
                    {style.name}
                  </h3>
                  <p className="text-white/80 text-xs font-light mt-1">
                    {style.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/create"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-light tracking-wide group"
            >
              <span>探索所有风格</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-6">
              简单流程
            </h2>
            <p className="text-xl text-gray-600 font-light">
              三步将您的宠物变成艺术品
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-light text-gray-900">上传照片</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                上传一张清晰、高质量的宠物照片，获得最佳效果
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-light text-gray-900">选择风格</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                从我们的艺术风格集合中选择，匹配您的视觉想象
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-light text-gray-900">获取作品</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                下载您的专业宠物肖像画，准备好打印或分享
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-extralight text-gray-900 mb-8 leading-tight">
            准备创造
            <span className="block text-gray-600">美丽作品了吗？</span>
          </h2>
          
          <p className="text-xl text-gray-600 font-light mb-12 max-w-2xl mx-auto">
            加入数千名宠物父母的行列，将您心爱的伴侣变成令人惊叹的艺术作品
          </p>

          <Link 
            href="/create"
            className="inline-flex items-center space-x-3 bg-gray-900 text-white px-10 py-5 text-base font-light tracking-wide hover:bg-gray-800 transition-all duration-300 group"
          >
            <span>开始您的肖像</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Link href="/" className="text-2xl font-extralight tracking-[0.2em] text-gray-900 mb-6 inline-block">
              PETPO
            </Link>
            <p className="text-sm text-gray-500 font-light tracking-wide">
              专业宠物肖像工作室 — AI 驱动
            </p>
            
            <div className="flex justify-center space-x-8 mt-8">
              <Link href="/gallery" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-light">
                画廊
              </Link>
              <Link href="/create" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-light">
                创作
              </Link>
              {!user && (
                <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-light">
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
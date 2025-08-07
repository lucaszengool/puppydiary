import { ClerkProvider } from '@clerk/nextjs'
import { Noto_Sans_SC, Kalam } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const notoSansSC = Noto_Sans_SC({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto'
})

const kalam = Kalam({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-kalam'
})

export const metadata = {
  title: 'PETPO - AI宠物艺术肖像',
  description: '专业级宠物影像创作平台，用AI技术将您的爱宠照片转化为高质量艺术作品',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="zh-CN">
        <body className={`${notoSansSC.variable} ${kalam.variable} font-sans`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
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
  title: '小狗日记 - 记录毛孩子的漫画时光',
  description: '用宫崎骏风格的手绘漫画记录您爱宠的每一个美好瞬间',
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
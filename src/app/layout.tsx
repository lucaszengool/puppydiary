import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata = {
  title: 'PETPO 宠物定制肖像',
  description: '专业宠物画作，用AI将爱宠照片转化为高质量艺术作品',
  metadataBase: new URL('https://petpoofficial.org'),
  openGraph: {
    title: 'PETPO 宠物定制肖像',
    description: '专业宠物画作，用AI将爱宠照片转化为高质量艺术作品',
    url: 'https://petpoofficial.org',
    siteName: 'PETPO',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PETPO 宠物定制肖像',
    description: '专业宠物画作，用AI将爱宠照片转化为高质量艺术作品',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="zh-CN">
        <head>
          {/* Google tag (gtag.js) */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZKRKZK57RM"></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZKRKZK57RM');
            `
          }} />
        </head>
        <body className="font-sans">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
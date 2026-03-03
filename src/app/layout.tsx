import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { Toaster } from '@/components/ui/sonner'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Finance Tracker 2026',
  description: 'Personal Finance Tracker — cashflow, expenses, dan wishlist',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Finance',
  },
  icons: {
    icon: [
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Sidebar />

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
              {children}
            </div>
          </main>

          <HamburgerMenu />
        </div>

        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}

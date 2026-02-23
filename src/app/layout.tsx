import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Finance Tracker 2026',
  description: 'Personal Finance Tracker',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Desktop only */}
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
            <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
              {children}
            </div>
          </main>

          {/* Bottom Navigation - Mobile only */}
          <BottomNav />
        </div>

        <Toaster />
      </body>
    </html>
  )
}

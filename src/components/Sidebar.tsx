'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Heart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: ShoppingCart,
  },
  {
    href: '/wishlist',
    label: 'Wishlist',
    icon: Heart,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r bg-white md:flex">
      {/* Header */}
      <div className="border-b p-6">
        <h1 className="text-xl font-bold text-slate-900">Finance Tracker</h1>
        <p className="text-xs text-slate-500 mt-1">2026 Edition</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

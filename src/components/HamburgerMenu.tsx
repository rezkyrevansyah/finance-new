'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Receipt,
  ShoppingBag,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: Receipt,
  },
  {
    name: 'Wishlist',
    href: '/wishlist',
    icon: ShoppingBag,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger Button - Fixed Top Right */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 md:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-slate-900" />
        ) : (
          <Menu className="h-6 w-6 text-slate-900" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-40 md:hidden transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b p-6 pt-20">
            <h2 className="text-xl font-bold text-slate-900">Menu</h2>
            <p className="text-xs text-slate-500 mt-1">Finance Tracker 2026</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-slate-400 text-center">
              © 2026 Finance Tracker
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

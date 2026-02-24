'use client'

import { useState } from 'react'
import { PeriodData } from '@/lib/cashflow'
import { formatRupiah } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calculator,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SummaryCardsProps {
  periods: PeriodData[]
  currentPeriod: number
  totalWishlistActive?: number
}

export function SummaryCards({
  periods,
  currentPeriod,
  totalWishlistActive = 0,
}: SummaryCardsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalIncome = periods.reduce((sum, p) => sum + p.totalIncome, 0)
  const totalExpenses = periods.reduce((sum, p) => sum + p.totalExpenses, 0)
  const netSavings = totalIncome - totalExpenses

  const currentPeriodData = periods.find((p) => p.period === currentPeriod)
  const currentBalance = currentPeriodData?.displayEndBalance || 0

  const passedPeriods = periods.filter((p) => p.period < currentPeriod)
  const avgExpenses =
    passedPeriods.length > 0
      ? passedPeriods.reduce((sum, p) => sum + p.totalExpenses, 0) /
        passedPeriods.length
      : 0

  const cards = [
    {
      label: 'Total Income 2026',
      value: totalIncome,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Expenses 2026',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Net Savings 2026',
      value: netSavings,
      icon: netSavings >= 0 ? TrendingUp : TrendingDown,
      color: netSavings >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: netSavings >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Saldo Saat Ini',
      value: currentBalance,
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Rata-rata Pengeluaran',
      value: avgExpenses,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Total Wishlist Aktif',
      value: totalWishlistActive,
      icon: ShoppingBag,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      isCount: true,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Mobile: Show only first card with expand button */}
      <div className="sm:hidden space-y-4">
        {cards.slice(0, 1).map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      {card.label}
                    </p>
                    <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                      {card.isCount
                        ? card.value.toLocaleString()
                        : formatRupiah(card.value)}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}
                  >
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Expanded cards */}
        {isExpanded && (
          <div className="grid gap-4">
            {cards.slice(1).map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-600">
                          {card.label}
                        </p>
                        <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                          {card.isCount
                            ? card.value.toLocaleString()
                            : formatRupiah(card.value)}
                        </p>
                      </div>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}
                      >
                        <Icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Sembunyikan
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Lihat Semua Card ({cards.length - 1} lainnya)
            </>
          )}
        </Button>
      </div>

      {/* Desktop: Show all cards in grid */}
      <div className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      {card.label}
                    </p>
                    <p
                      className={`mt-2 text-2xl font-bold ${card.color}`}
                    >
                      {card.isCount
                        ? card.value.toLocaleString()
                        : formatRupiah(card.value)}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}
                  >
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { PeriodData } from '@/lib/cashflow'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CashFlowTable } from '@/components/dashboard/CashFlowTable'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface CashflowResponse {
  periods: PeriodData[]
  currentPeriod: number
}

interface WishlistItem {
  id: string
  name: string
  price: number
  targetPeriod?: number
  targetYear?: number
  isActive: boolean
  note?: string
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const [cashflowData, setCashflowData] = useState<CashflowResponse | null>(null)
  const [wishlistData, setWishlistData] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      else setIsLoading(true)

      const [cashflowRes, wishlistRes] = await Promise.all([
        fetch('/api/cashflow'),
        fetch('/api/wishlist'),
      ])

      if (!cashflowRes.ok || !wishlistRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const cashflow = await cashflowRes.json()
      const wishlist = await wishlistRes.json()

      setCashflowData(cashflow)
      setWishlistData(wishlist)

      if (showToast) {
        toast.success('Data berhasil diperbarui')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    fetchData(true)
  }

  const totalWishlistActive = wishlistData.filter((w) => w.isActive).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Gajian setiap tanggal 25
          </p>
        </div>

        {/* Loading Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  if (!cashflowData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Tidak ada data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Gajian setiap tanggal 25
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        periods={cashflowData.periods}
        currentPeriod={cashflowData.currentPeriod}
        totalWishlistActive={totalWishlistActive}
      />

      {/* CashFlow Table */}
      <CashFlowTable
        periods={cashflowData.periods}
        currentPeriod={cashflowData.currentPeriod}
      />
    </div>
  )
}

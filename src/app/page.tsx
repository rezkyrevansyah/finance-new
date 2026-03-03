'use client'

import { useEffect, useState } from 'react'
import { PeriodData } from '@/lib/cashflow'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CashFlowSection } from '@/components/dashboard/CashFlowSection'
import { QuickAddExpenseDialog } from '@/components/dashboard/QuickAddExpenseDialog'
import { QuickAddIncomeDialog } from '@/components/dashboard/QuickAddIncomeDialog'
import { Button } from '@/components/ui/button'
import { RefreshCw, PlusCircle } from 'lucide-react'
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)

      const [cashflowRes, wishlistRes] = await Promise.all([
        fetch('/api/cashflow', { cache: 'no-store' }),
        fetch('/api/wishlist', { cache: 'no-store' }),
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

  if (!cashflowData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Tidak ada data</p>
          <p className="text-slate-400 text-sm mt-1">Mulai dengan mengatur konfigurasi di Settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Gajian setiap tanggal 25 • 2026 Edition
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

      {/* Quick Add Bar */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-12 border-dashed border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
          onClick={() => setExpenseDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Expense
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-12 border-dashed border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
          onClick={() => setIncomeDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Income
        </Button>
      </div>

      {/* CashFlow Section (Table + Timeline tabs) */}
      <CashFlowSection
        periods={cashflowData.periods}
        currentPeriod={cashflowData.currentPeriod}
      />

      {/* Quick Add Dialogs */}
      <QuickAddExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        currentPeriod={cashflowData.currentPeriod}
        onSuccess={() => fetchData()}
      />
      <QuickAddIncomeDialog
        open={incomeDialogOpen}
        onOpenChange={setIncomeDialogOpen}
        currentPeriod={cashflowData.currentPeriod}
        onSuccess={() => fetchData()}
      />
    </div>
  )
}

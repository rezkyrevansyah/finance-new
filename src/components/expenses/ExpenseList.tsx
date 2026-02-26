'use client'

import { useState } from 'react'
import { formatRupiah, getPeriodLabel } from '@/lib/utils'
import { Pencil, Trash2, Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Expense {
  id: string
  name: string
  amount: number
  period: number
  year: number
  date?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
}

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  onResetAll: () => void
}

export function ExpenseList({ expenses, onEdit, onDelete, onResetAll }: ExpenseListProps) {
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const filteredExpenses = expenses.filter((expense) => {
    if (filterPeriod === 'all') return true
    return expense.period === parseInt(filterPeriod)
  })

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  const handleDelete = async () => {
    if (!deleteId) return

    const idToDelete = deleteId
    setDeleteId(null)

    // Optimistic update - call parent to remove from UI immediately
    onDelete(idToDelete)

    try {
      const response = await fetch(`/api/expenses/${idToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      toast.success('Expense berhasil dihapus')
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Gagal menghapus expense')
      // On error, parent should refetch to restore data
      window.location.reload()
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-slate-600 font-medium">Belum ada expense</p>
          <p className="text-slate-400 text-sm mt-1">Klik tombol &quot;Tambah Expense&quot; untuk memulai</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border p-6">
        {/* Filter Section */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Filter className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Filter by Period</h3>
              <p className="text-xs text-slate-500">Total: {filteredExpenses.length} expenses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">

          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Periode</SelectItem>
              {[...Array(12)].map((_, i) => {
                const period = i + 1
                return (
                  <SelectItem key={period} value={String(period)}>
                    {getPeriodLabel(period)}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset Semua
          </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Period
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="group border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-slate-900">{expense.name}</div>
                      {expense.note && (
                        <div className="text-xs text-slate-500 mt-0.5">{expense.note}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                      {getPeriodLabel(expense.period)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-600">{formatDate(expense.date)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-red-600">{formatRupiah(expense.amount)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(expense)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(expense.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-red-50 border-t-2 border-red-200">
                <td colSpan={3} className="py-4 px-4">
                  <span className="font-bold text-slate-900 text-lg">Total</span>
                </td>
                <td className="py-4 px-4 text-right" colSpan={2}>
                  <span className="font-bold text-red-600 text-xl">
                    {formatRupiah(totalExpenses)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Single Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus expense ini? Aksi ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset All Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <RotateCcw className="h-5 w-5" />
              Reset Semua Expense
            </DialogTitle>
            <DialogDescription>
              Semua data expense akan dihapus permanen. Aksi ini{' '}
              <span className="font-semibold text-slate-800">tidak dapat dibatalkan</span>.
              Pastikan Anda yakin sebelum melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowResetDialog(false)
                onResetAll()
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Ya, Reset Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

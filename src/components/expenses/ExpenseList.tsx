'use client'

import { useState } from 'react'
import { formatRupiah, getPeriodLabel } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  onDelete: () => void
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredExpenses = expenses.filter((expense) => {
    if (filterPeriod === 'all') return true
    return expense.period === parseInt(filterPeriod)
  })

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  const handleDelete = async () => {
    if (!deleteId) return

    // Close dialog & update UI instantly
    setDeleteId(null)
    onDelete()

    try {
      const response = await fetch(`/api/expenses/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      toast.success('Expense berhasil dihapus')
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Gagal menghapus expense')
      // Refetch to restore
      onDelete()
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Filter Periode:</label>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
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
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Tidak ada pengeluaran
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.name}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {formatRupiah(expense.amount)}
                    </TableCell>
                    <TableCell>{getPeriodLabel(expense.period)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                      {expense.note || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Total */}
        {filteredExpenses.length > 0 && (
          <div className="border-t bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">
                Total Pengeluaran ({filteredExpenses.length} item)
              </span>
              <span className="text-xl font-bold text-red-600">
                {formatRupiah(totalExpenses)}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
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
    </div>
  )
}

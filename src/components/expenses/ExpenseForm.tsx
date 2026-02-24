'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { getPeriodLabel } from '@/lib/utils'
import { useRupiahInput } from '@/hooks/useRupiahInput'

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
  onSuccess: (expense?: Expense) => void
}

interface Expense {
  id: string
  name: string
  amount: number
  period: number
  year: number
  date?: string | null
  note?: string | null
}

export function ExpenseForm({ open, onOpenChange, expense, onSuccess }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const amount = useRupiahInput(0)
  const [isRecurring, setIsRecurring] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    period: '1',
    year: 2026,
    date: '',
    note: '',
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name,
        period: String(expense.period),
        year: expense.year,
        date: expense.date ? expense.date.split('T')[0] : '',
        note: expense.note || '',
      })
      amount.setValue(expense.amount)
      setIsRecurring(false)
    } else {
      setFormData({
        name: '',
        period: '1',
        year: 2026,
        date: '',
        note: '',
      })
      amount.setValue(0)
      setIsRecurring(false)
    }
  }, [expense, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // If recurring, create expense for all 12 months
      if (isRecurring && !expense) {
        const promises = []
        for (let period = 1; period <= 12; period++) {
          const payload = {
            name: formData.name,
            amount: amount.numericValue,
            period: period,
            year: formData.year,
            date: formData.date || undefined,
            note: formData.note || undefined,
          }
          promises.push(
            fetch('/api/expenses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          )
        }

        const responses = await Promise.all(promises)
        const failedResponses = responses.filter(r => !r.ok)

        if (failedResponses.length > 0) {
          throw new Error('Failed to save some recurring expenses')
        }

        toast.success('Expense recurring berhasil ditambahkan untuk semua bulan')
      } else {
        // Single expense
        const payload = {
          name: formData.name,
          amount: amount.numericValue,
          period: parseInt(formData.period),
          year: formData.year,
          date: formData.date || undefined,
          note: formData.note || undefined,
        }

        const url = expense ? `/api/expenses/${expense.id}` : '/api/expenses'
        const method = expense ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error('Failed to save expense')
        }

        const savedExpense = await response.json()
        toast.success(expense ? 'Expense berhasil diupdate' : 'Expense berhasil ditambahkan')

        onSuccess(savedExpense)
        onOpenChange(false)
        return
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving expense:', error)
      toast.error('Gagal menyimpan expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Tambah Expense'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Pengeluaran *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Listrik, Internet, dll"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp) *</Label>
            <Input
              id="amount"
              type="text"
              value={amount.displayValue}
              onChange={(e) => amount.handleChange(e.target.value)}
              placeholder="Masukkan nominal"
              required
            />
          </div>

          {/* Recurring Expense Toggle - Only show when adding new */}
          {!expense && (
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recurring" className="text-base">
                    Expense Recurring
                  </Label>
                  <p className="text-sm text-slate-500">
                    Tambahkan expense ini ke semua bulan (1-12)
                  </p>
                </div>
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>
              {isRecurring && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  Expense ini akan ditambahkan ke semua 12 bulan dengan nama dan jumlah yang sama
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">
                Periode * {isRecurring && '(akan diabaikan)'}
              </Label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData({ ...formData, period: value })}
                disabled={isRecurring}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal (Opsional)</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan (Opsional)</Label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Catatan tambahan..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

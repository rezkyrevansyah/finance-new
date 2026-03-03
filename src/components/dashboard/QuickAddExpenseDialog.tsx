'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getPeriodLabel } from '@/lib/utils'
import { useRupiahInput } from '@/hooks/useRupiahInput'
import { ChevronDown } from 'lucide-react'

interface QuickAddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPeriod: number
  onSuccess: () => void
}

export function QuickAddExpenseDialog({
  open,
  onOpenChange,
  currentPeriod,
  onSuccess,
}: QuickAddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const amount = useRupiahInput(0)
  const [formData, setFormData] = useState({
    name: '',
    period: String(currentPeriod),
    note: '',
  })

  useEffect(() => {
    if (open) {
      setFormData({ name: '', period: String(currentPeriod), note: '' })
      amount.setValue(0)
      setShowNote(false)
    }
  }, [open, currentPeriod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || amount.numericValue <= 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          amount: amount.numericValue,
          period: parseInt(formData.period),
          year: 2026,
          note: formData.note.trim() || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to save expense')

      toast.success('Expense berhasil ditambahkan')
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Gagal menyimpan expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-red-700">Tambah Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-name">Nama Pengeluaran *</Label>
            <Input
              id="expense-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Listrik, Internet, dll"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-amount">Jumlah (Rp) *</Label>
            <Input
              id="expense-amount"
              type="text"
              value={amount.displayValue}
              onChange={(e) => amount.handleChange(e.target.value)}
              placeholder="Masukkan nominal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-period">Periode *</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => setFormData({ ...formData, period: value })}
            >
              <SelectTrigger id="expense-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(12)].map((_, i) => {
                  const p = i + 1
                  return (
                    <SelectItem key={p} value={String(p)}>
                      {getPeriodLabel(p)}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Optional note toggle */}
          {!showNote ? (
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowNote(true)}
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Tambah catatan
            </button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="expense-note">Catatan (Opsional)</Label>
              <textarea
                id="expense-note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Catatan tambahan..."
                className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

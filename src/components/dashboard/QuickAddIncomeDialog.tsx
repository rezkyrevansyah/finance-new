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

interface QuickAddIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPeriod: number
  onSuccess: () => void
}

export function QuickAddIncomeDialog({
  open,
  onOpenChange,
  currentPeriod,
  onSuccess,
}: QuickAddIncomeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const amount = useRupiahInput(0)
  const [formData, setFormData] = useState({
    label: '',
    period: String(currentPeriod),
  })

  useEffect(() => {
    if (open) {
      setFormData({ label: '', period: String(currentPeriod) })
      amount.setValue(0)
    }
  }, [open, currentPeriod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.label.trim() || amount.numericValue <= 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/thr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: formData.label.trim(),
          amount: amount.numericValue,
          period: parseInt(formData.period),
          year: 2026,
        }),
      })

      if (!response.ok) throw new Error('Failed to save income')

      toast.success('Income berhasil ditambahkan')
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Gagal menyimpan income')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-green-700">Tambah Income / Bonus</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-500 -mt-2">
          Tambahkan bonus, THR, atau income tambahan lainnya.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-label">Label Income *</Label>
            <Input
              id="income-label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Contoh: THR Lebaran, Bonus Tahunan"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-amount">Jumlah (Rp) *</Label>
            <Input
              id="income-amount"
              type="text"
              value={amount.displayValue}
              onChange={(e) => amount.handleChange(e.target.value)}
              placeholder="Masukkan nominal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-period">Periode *</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => setFormData({ ...formData, period: value })}
            >
              <SelectTrigger id="income-period">
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

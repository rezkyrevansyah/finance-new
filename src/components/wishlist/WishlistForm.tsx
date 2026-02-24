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

interface WishlistFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wishlist?: WishlistItem | null
  onSuccess: (wishlist?: WishlistItem) => void
}

interface WishlistItem {
  id: string
  name: string
  price: number
  targetPeriod?: number | null
  targetYear?: number | null
  isActive: boolean
  note?: string | null
  createdAt: string
  updatedAt: string
}

export function WishlistForm({ open, onOpenChange, wishlist, onSuccess }: WishlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const price = useRupiahInput(0)
  const [formData, setFormData] = useState({
    name: '',
    targetPeriod: '',
    note: '',
  })

  useEffect(() => {
    if (wishlist) {
      setFormData({
        name: wishlist.name,
        targetPeriod: wishlist.targetPeriod ? String(wishlist.targetPeriod) : '',
        note: wishlist.note || '',
      })
      price.setValue(wishlist.price)
    } else {
      setFormData({
        name: '',
        targetPeriod: '',
        note: '',
      })
      price.setValue(0)
    }
  }, [wishlist, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        price: price.numericValue,
        targetPeriod: formData.targetPeriod ? parseInt(formData.targetPeriod) : undefined,
        targetYear: formData.targetPeriod ? 2026 : undefined,
        note: formData.note || undefined,
      }

      const url = wishlist ? `/api/wishlist/${wishlist.id}` : '/api/wishlist'
      const method = wishlist ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save wishlist')
      }

      const savedWishlist = await response.json()
      toast.success(wishlist ? 'Wishlist berhasil diupdate' : 'Wishlist berhasil ditambahkan')
      onSuccess(savedWishlist)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving wishlist:', error)
      toast.error('Gagal menyimpan wishlist')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{wishlist ? 'Edit Wishlist' : 'Tambah Wishlist'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Barang *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Laptop, Smartphone, dll"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Harga (Rp) *</Label>
            <Input
              id="price"
              type="text"
              value={price.displayValue}
              onChange={(e) => price.handleChange(e.target.value)}
              placeholder="Masukkan nominal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPeriod">Target Bulan (Opsional)</Label>
            <Select
              value={formData.targetPeriod === '' ? 'none' : formData.targetPeriod}
              onValueChange={(value) => setFormData({ ...formData, targetPeriod: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Belum ditentukan --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Belum ditentukan --</SelectItem>
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

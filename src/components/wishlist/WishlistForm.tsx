'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getPeriodLabel } from '@/lib/utils'

interface WishlistFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wishlist?: WishlistItem | null
  onSuccess: () => void
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
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    targetPeriod: '',
    note: '',
  })

  useEffect(() => {
    if (wishlist) {
      setFormData({
        name: wishlist.name,
        price: String(wishlist.price),
        targetPeriod: wishlist.targetPeriod ? String(wishlist.targetPeriod) : '',
        note: wishlist.note || '',
      })
    } else {
      setFormData({
        name: '',
        price: '',
        targetPeriod: '',
        note: '',
      })
    }
  }, [wishlist, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
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

      toast.success(wishlist ? 'Wishlist berhasil diupdate' : 'Wishlist berhasil ditambahkan')
      onSuccess()
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
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPeriod">Target Bulan (Opsional)</Label>
            <Select
              value={formData.targetPeriod}
              onValueChange={(value) => setFormData({ ...formData, targetPeriod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Belum ditentukan --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Belum ditentukan --</SelectItem>
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

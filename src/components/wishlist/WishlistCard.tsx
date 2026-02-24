'use client'

import { useState } from 'react'
import { formatRupiah, getPeriodLabel } from '@/lib/utils'
import { Pencil, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

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

interface WishlistCardProps {
  item: WishlistItem
  onEdit: (item: WishlistItem) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isActive: boolean) => void
}

export function WishlistCard({ item, onEdit, onDelete, onToggle }: WishlistCardProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleToggle = async (checked: boolean) => {
    onToggle(item.id, checked)

    try {
      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: checked }),
      })

      if (!response.ok) {
        throw new Error('Failed to update wishlist')
      }

      toast.success(checked ? 'Wishlist diaktifkan' : 'Wishlist dinonaktifkan')
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      onToggle(item.id, !checked)
      toast.error('Gagal mengubah status wishlist')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const idToDelete = deleteId
    setDeleteId(null)

    // Optimistic update - call parent to remove from UI immediately
    onDelete(idToDelete)

    try {
      const response = await fetch(`/api/wishlist/${idToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete wishlist')
      }

      toast.success('Wishlist berhasil dihapus')
    } catch (error) {
      console.error('Error deleting wishlist:', error)
      toast.error('Gagal menghapus wishlist')
      // On error, reload to restore data
      window.location.reload()
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          {/* Header with Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="font-bold text-slate-900 text-lg line-clamp-2">{item.name}</h3>
              {!item.isActive && (
                <Badge variant="secondary" className="mt-2 bg-slate-200 text-slate-600">
                  Tidak Aktif
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(item.id)}
                className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Price */}
          <div className="py-4">
            <p className="text-3xl font-bold text-pink-600">
              {formatRupiah(item.price)}
            </p>
          </div>

          {/* Target Period */}
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Target</p>
              <p className="font-medium text-slate-700">
                {item.targetPeriod ? `${getPeriodLabel(item.targetPeriod)} ${item.targetYear || ''}` : 'Belum ditentukan'}
              </p>
            </div>
          </div>

          {/* Note */}
          {item.note && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-600 line-clamp-2">
                {item.note}
              </p>
            </div>
          )}

          {/* Toggle Switch */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-sm font-medium text-slate-700">
              Status Aktif
            </span>
            <Switch
              checked={item.isActive}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus wishlist ini? Aksi ini tidak dapat dibatalkan.
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
    </>
  )
}

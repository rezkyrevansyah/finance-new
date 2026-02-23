'use client'

import { useState } from 'react'
import { formatRupiah, getPeriodLabel } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  onDelete: () => void
  onToggle: (id: string, isActive: boolean) => void
}

export function WishlistCard({ item, onEdit, onDelete, onToggle }: WishlistCardProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleToggle = async (checked: boolean) => {
    // Optimistic update - instant UI
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
      // Rollback on error
      onToggle(item.id, !checked)
      toast.error('Gagal mengubah status wishlist')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    // Close dialog & update UI instantly
    setDeleteId(null)
    onDelete()

    try {
      const response = await fetch(`/api/wishlist/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete wishlist')
      }

      toast.success('Wishlist berhasil dihapus')
    } catch (error) {
      console.error('Error deleting wishlist:', error)
      toast.error('Gagal menghapus wishlist')
      // Refetch to restore
      onDelete()
    }
  }

  return (
    <>
      <Card className={`p-4 transition-opacity ${!item.isActive ? 'opacity-50' : ''}`}>
        <div className="space-y-3">
          {/* Header with Name and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              {!item.isActive && (
                <Badge variant="secondary" className="mt-1">
                  Tidak Aktif
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(item.id)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-blue-600">
            {formatRupiah(item.price)}
          </div>

          {/* Target Period */}
          <div className="text-sm text-gray-600">
            Target: {item.targetPeriod ? `${getPeriodLabel(item.targetPeriod)} ${item.targetYear || ''}` : 'Belum ditentukan'}
          </div>

          {/* Note */}
          {item.note && (
            <div className="text-sm text-gray-500 italic line-clamp-2">
              {item.note}
            </div>
          )}

          {/* Toggle Switch */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium text-gray-700">
              Status
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {item.isActive ? 'Aktif' : 'Tidak Aktif'}
              </span>
              <Switch
                checked={item.isActive}
                onCheckedChange={handleToggle}
              />
            </div>
          </div>
        </div>
      </Card>

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

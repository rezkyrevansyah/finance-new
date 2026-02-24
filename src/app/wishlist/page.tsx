'use client'

import { useEffect, useState } from 'react'
import { WishlistForm } from '@/components/wishlist/WishlistForm'
import { WishlistCard } from '@/components/wishlist/WishlistCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

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

type FilterType = 'all' | 'active' | 'inactive'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistItem | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist')
      }

      const data = await response.json()
      setWishlist(data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleAdd = () => {
    setSelectedWishlist(null)
    setFormOpen(true)
  }

  const handleEdit = (item: WishlistItem) => {
    setSelectedWishlist(item)
    setFormOpen(true)
  }

  const handleSuccess = (newItem?: WishlistItem) => {
    if (newItem) {
      // Optimistic update for create/update
      setWishlist(prev => {
        const exists = prev.find(w => w.id === newItem.id)
        if (exists) {
          // Update existing
          return prev.map(w => w.id === newItem.id ? newItem : w)
        } else {
          // Add new
          return [newItem, ...prev]
        }
      })
    } else {
      // Fallback: refetch all
      fetchWishlist()
    }
  }

  const handleToggle = (id: string, isActive: boolean) => {
    // Optimistic update
    setWishlist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive } : item))
    )
  }

  const handleDelete = (id: string) => {
    // Optimistic update - remove immediately
    setWishlist((prev) => prev.filter((item) => item.id !== id))
  }

  const filteredWishlist = wishlist.filter((item) => {
    if (filter === 'active') return item.isActive
    if (filter === 'inactive') return !item.isActive
    return true
  })

  const sortedWishlist = [...filteredWishlist].sort((a, b) => {
    if (a.targetPeriod === null && b.targetPeriod === null) return 0
    if (a.targetPeriod === null) return 1
    if (b.targetPeriod === null) return -1
    return (a.targetPeriod || 0) - (b.targetPeriod || 0)
  })

  const totalBudgetActive = wishlist
    .filter((item) => item.isActive)
    .reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Wishlist
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track barang yang ingin Anda beli
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Wishlist
        </Button>
      </div>

      {/* Total Budget Card */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">
              Total Budget Wishlist Aktif
            </p>
            <p className="text-3xl font-bold text-pink-600 mt-1">
              {formatRupiah(totalBudgetActive)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600">
              {wishlist.filter((item) => item.isActive).length} item aktif
            </p>
            <p className="text-xs text-slate-500">
              dari {wishlist.length} total item
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value: string) => setFilter(value as FilterType)}>
        <TabsList>
          <TabsTrigger value="all">
            Semua ({wishlist.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktif ({wishlist.filter((item) => item.isActive).length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Tidak Aktif ({wishlist.filter((item) => !item.isActive).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Wishlist Grid */}
      {sortedWishlist.length === 0 ? (
        <div className="bg-white rounded-lg border p-12">
          <div className="text-center">
            <p className="text-slate-600 font-medium">
              {filter === 'all' ? 'Belum ada wishlist' : `Tidak ada wishlist ${filter === 'active' ? 'aktif' : 'tidak aktif'}`}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Klik tombol "Tambah Wishlist" untuk memulai
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedWishlist.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Wishlist Form Dialog */}
      <WishlistForm
        open={formOpen}
        onOpenChange={setFormOpen}
        wishlist={selectedWishlist}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

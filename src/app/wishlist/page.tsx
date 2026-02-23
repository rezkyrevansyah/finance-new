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
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistItem | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const fetchWishlist = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/wishlist')

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist')
      }

      const data = await response.json()
      setWishlist(data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setIsLoading(false)
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

  const handleSuccess = () => {
    fetchWishlist()
  }

  const handleToggle = (id: string, isActive: boolean) => {
    // Optimistic update - instant UI
    setWishlist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive } : item))
    )
  }

  const handleDelete = () => {
    // Refetch to update list
    fetchWishlist()
  }

  // Filter wishlist
  const filteredWishlist = wishlist.filter((item) => {
    if (filter === 'active') return item.isActive
    if (filter === 'inactive') return !item.isActive
    return true
  })

  // Sort by target period ascending (items without target period at the end)
  const sortedWishlist = [...filteredWishlist].sort((a, b) => {
    if (a.targetPeriod === null && b.targetPeriod === null) return 0
    if (a.targetPeriod === null) return 1
    if (b.targetPeriod === null) return -1
    return (a.targetPeriod || 0) - (b.targetPeriod || 0)
  })

  // Calculate total budget for active items
  const totalBudgetActive = wishlist
    .filter((item) => item.isActive)
    .reduce((sum, item) => sum + item.price, 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track items you want to buy
          </p>
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track items you want to buy
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Wishlist
        </Button>
      </div>

      {/* Total Budget */}
      <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Budget Wishlist Aktif
            </p>
            <p className="mt-1 text-3xl font-bold text-blue-600">
              {formatRupiah(totalBudgetActive)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {wishlist.filter((item) => item.isActive).length} item aktif
            </p>
            <p className="text-xs text-gray-500">
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
        <div className="rounded-lg border border-dashed bg-white p-12">
          <div className="text-center text-gray-500">
            <p className="text-sm font-medium">
              {filter === 'all' ? 'Belum ada wishlist' : `Tidak ada wishlist ${filter === 'active' ? 'aktif' : 'tidak aktif'}`}
            </p>
            <p className="mt-1 text-xs">
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

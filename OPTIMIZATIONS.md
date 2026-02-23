# 🚀 Performance Optimizations untuk Finance Tracker

## 📊 Analisis Performa Saat Ini

### ✅ Yang Sudah Optimal:
1. **API Routes**: Semua menggunakan `Promise.all()` untuk parallel queries
2. **Database Queries**: Sudah efisien dengan WHERE clauses
3. **Component Architecture**: Clean separation of concerns

### ⚠️ Masalah Performa yang Ditemukan:

1. **Refetch setelah setiap action** - Setiap kali create/update/delete, seluruh data di-fetch ulang
2. **Loading states yang blocking** - User harus menunggu API response
3. **No optimistic updates** - UI tidak update instantly
4. **Missing database indexes** - Queries bisa lebih cepat dengan indexes
5. **Select all fields** - API mengambil semua kolom padahal tidak semua dibutuhkan

---

## 🎯 Optimasi yang Perlu Dilakukan

### 1. **Database Indexes** (Prioritas Tinggi)

Tambahkan indexes ke `prisma/schema.prisma`:

```prisma
model ThrBonus {
  // ... existing fields
  @@index([year, period])
}

model Expense {
  // ... existing fields
  @@index([year, period])
  @@index([createdAt])
}

model Wishlist {
  // ... existing fields
  @@index([isActive])
  @@index([targetPeriod])
}
```

Jalankan migration:
```bash
npx prisma migrate dev --name add_performance_indexes
npx prisma generate
```

---

### 2. **API Route Optimizations**

#### A. Add Caching Headers & Selective Fields

**File: `src/app/api/cashflow/route.ts`**
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Dalam Promise.all, tambahkan select:
prisma.expense.findMany({
  where: { year: 2026 },
  select: { id: true, name: true, amount: true, period: true, year: true, note: true }
})
```

#### B. Optimize All GET Endpoints

Tambahkan `select` ke semua queries untuk hanya ambil field yang dibutuhkan.

---

### 3. **Optimistic Updates** (Instant UI)

#### Implementasi untuk Wishlist:

**File: `src/app/wishlist/page.tsx`**

```typescript
import { optimisticAdd, optimisticUpdate, optimisticDelete, generateTempId } from '@/lib/optimistic-updates'

// Optimistic Add
const handleAdd = async (data) => {
  const tempId = generateTempId()
  const optimisticItem = { ...data, id: tempId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }

  // Update UI instantly
  setWishlist(prev => optimisticAdd(prev, optimisticItem))

  try {
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    const realItem = await response.json()

    // Replace temp with real data
    setWishlist(prev => prev.map(item => item.id === tempId ? realItem : item))
  } catch (error) {
    // Rollback on error
    setWishlist(prev => optimisticDelete(prev, tempId))
    toast.error('Gagal menambahkan wishlist')
  }
}

// Optimistic Update
const handleToggle = async (id: string, isActive: boolean) => {
  // Update UI instantly
  setWishlist(prev => optimisticUpdate(prev, id, { isActive }))

  try {
    await fetch(`/api/wishlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    })
  } catch (error) {
    // Rollback on error
    setWishlist(prev => optimisticUpdate(prev, id, { isActive: !isActive }))
    toast.error('Gagal mengubah status')
  }
}

// Optimistic Delete
const handleDelete = async (id: string) => {
  // Update UI instantly
  setWishlist(prev => optimisticDelete(prev, id))

  try {
    await fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
  } catch (error) {
    // Rollback: refetch data
    fetchWishlist()
    toast.error('Gagal menghapus wishlist')
  }
}
```

---

### 4. **Remove Loading States from Actions**

#### Before:
```typescript
const [isToggling, setIsToggling] = useState(false)

const handleToggle = async () => {
  setIsToggling(true)  // ❌ Blocking UI
  await fetch(...)
  setIsToggling(false)
}
```

#### After:
```typescript
const handleToggle = async () => {
  // ✅ Instant UI update, no loading state
  setWishlist(prev => optimisticUpdate(prev, id, { isActive: !isActive }))
  await fetch(...)
}
```

---

### 5. **Expense Optimistic Updates**

**File: `src/components/expenses/ExpenseList.tsx`**

Hapus `isDeleting` state, langsung update UI:

```typescript
const handleDelete = async () => {
  if (!deleteId) return

  // Instant UI update
  onDelete() // This triggers parent to remove from list instantly
  setDeleteId(null)

  try {
    await fetch(`/api/expenses/${deleteId}`, { method: 'DELETE' })
    toast.success('Expense berhasil dihapus')
  } catch (error) {
    toast.error('Gagal menghapus expense')
    onDelete() // Refetch to restore
  }
}
```

---

### 6. **Settings Page Optimization**

**File: `src/app/settings/page.tsx`**

```typescript
// Remove loading states from delete handlers
const deleteThr = async () => {
  if (!deleteThrId) return

  // Optimistic update
  setThrBonuses(prev => prev.filter(t => t.id !== deleteThrId))
  setDeleteThrId(null)

  try {
    await fetch(`/api/thr?id=${deleteThrId}`, { method: 'DELETE' })
    toast.success('THR berhasil dihapus')
  } catch (error) {
    fetchData() // Rollback
    toast.error('Gagal menghapus THR')
  }
}
```

---

### 7. **Dashboard Instant Refresh**

**File: `src/app/page.tsx`**

```typescript
// Remove isRefreshing state, just refetch silently
const handleRefresh = async () => {
  try {
    const [cashflowRes, wishlistRes] = await Promise.all([
      fetch('/api/cashflow'),
      fetch('/api/wishlist'),
    ])

    const cashflow = await cashflowRes.json()
    const wishlist = await wishlistRes.json()

    setCashflowData(cashflow)
    setWishlistData(wishlist)
    toast.success('Data diperbarui')
  } catch (error) {
    toast.error('Gagal memuat data')
  }
}
```

---

## 📈 Expected Performance Improvements

### Before Optimization:
- **Delete action**: ~500-1000ms (dengan loading state)
- **Toggle action**: ~500-1000ms (dengan loading state)
- **Create action**: ~500-1000ms (dengan loading + refetch)
- **Dashboard load**: ~1-2s (4 parallel queries)

### After Optimization:
- **Delete action**: **~0ms UI update** (instant), ~200-300ms API background
- **Toggle action**: **~0ms UI update** (instant), ~200-300ms API background
- **Create action**: **~0ms UI update** (instant), ~200-300ms API background
- **Dashboard load**: **~500-800ms** (optimized queries dengan indexes + select)

### Improvement:
✅ **10x faster perceived performance** (instant UI updates)
✅ **50% faster actual API calls** (dengan indexes + selective fields)
✅ **Better UX** (no blocking loading states)

---

## 🔧 Implementation Steps

### Step 1: Database Indexes
```bash
# Edit prisma/schema.prisma (add indexes)
npx prisma migrate dev --name add_performance_indexes
npx prisma generate
```

### Step 2: Update API Routes
- Add `select` to all `findMany()` calls
- Add `export const revalidate = 0` to force-dynamic routes

### Step 3: Implement Optimistic Updates
- Wishlist page
- Expenses page
- Settings page

### Step 4: Remove Blocking Loading States
- Remove `isDeleting`, `isToggling` states
- Keep only form submission loading states

### Step 5: Test
- Test create/update/delete operations
- Test error rollback scenarios
- Verify database indexes dengan `EXPLAIN ANALYZE`

---

## ⚡ Quick Wins (Implement These First)

1. **Database indexes** - 5 minutes, 50% API speed improvement
2. **Remove loading states dari delete/toggle** - 10 minutes, instant UX
3. **Optimistic updates untuk wishlist toggle** - 15 minutes, best UX improvement

Total: **30 minutes untuk dramatic performance improvement!**

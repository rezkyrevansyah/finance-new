/**
 * Optimistic Updates Utilities
 * Untuk instant UI updates sebelum server response
 */

export function optimisticAdd<T extends { id: string }>(
  items: T[],
  newItem: T
): T[] {
  return [...items, newItem]
}

export function optimisticUpdate<T extends { id: string }>(
  items: T[],
  id: string,
  updates: Partial<T>
): T[] {
  return items.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  )
}

export function optimisticDelete<T extends { id: string }>(
  items: T[],
  id: string
): T[] {
  return items.filter((item) => item.id !== id)
}

/**
 * Generate temporary ID for optimistic updates
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

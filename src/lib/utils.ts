import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export function getPeriodLabel(period: number): string {
  return MONTH_NAMES[period - 1] || ''
}

export function getPeriodDateRange(period: number, year: number): string {
  if (period === 1) {
    return `1 Jan – 24 Jan ${year}`
  }

  const prevMonth = period - 2
  const currentMonth = period - 1

  const startMonth = MONTH_NAMES_SHORT[prevMonth]
  const endMonth = MONTH_NAMES_SHORT[currentMonth]

  return `25 ${startMonth} – 24 ${endMonth} ${year}`
}

export function getCurrentPeriod(date: Date = new Date()): number {
  const day = date.getDate()
  const month = date.getMonth() + 1 // 1-12

  if (day >= 25) {
    // Next month, or wrap to period 1 if December
    return month === 12 ? 1 : month + 1
  } else {
    // Current month
    return month
  }
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

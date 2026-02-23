'use client'

import { PeriodData } from '@/lib/cashflow'
import { formatRupiah } from '@/lib/utils'

interface MonthDetailProps {
  period: PeriodData
}

export default function MonthDetail({ period }: MonthDetailProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{period.label}</h3>
        <span className="text-sm text-muted-foreground">{period.dateRange}</span>
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span>Saldo Awal</span>
          <span>{formatRupiah(period.startingBalance)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Salary</span>
          <span>+ {formatRupiah(period.salary)}</span>
        </div>
        {period.thrBonusItems.map((thr, i) => (
          <div key={i} className="flex justify-between text-green-600">
            <span className="pl-4">{thr.label}</span>
            <span>+ {formatRupiah(thr.amount)}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between font-medium text-green-600">
          <span>Total Income</span>
          <span>+ {formatRupiah(period.totalIncome)}</span>
        </div>
      </div>

      {period.expenses.length > 0 && (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-red-500">Expenses:</p>
          {period.expenses.map((e) => (
            <div key={e.id} className="flex justify-between pl-4">
              <span>{e.name}{e.note ? ` (${e.note})` : ''}</span>
              <span className="text-red-500">- {formatRupiah(e.amount)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-medium text-red-500">
            <span>Total Expenses</span>
            <span>- {formatRupiah(period.totalExpenses)}</span>
          </div>
        </div>
      )}

      <div className="border-t pt-2 flex justify-between font-bold">
        <span>
          Saldo Akhir
          {period.isForced && (
            <span className="ml-1 text-xs font-normal text-orange-500">
              (Override{period.forceReason ? `: ${period.forceReason}` : ''})
            </span>
          )}
        </span>
        <span className={period.displayEndBalance < 0 ? 'text-red-600' : ''}>
          {formatRupiah(period.displayEndBalance)}
        </span>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { formatRupiah, getPeriodLabel } from '@/lib/utils'

interface ForceBalance {
  id: string
  period: number
  year: number
  amount: number
  reason?: string | null
}

interface ForceBalanceFormProps {
  forceBalances: ForceBalance[]
  onUpsert: (data: { period: number; year: number; amount: number; reason?: string }) => void
  onDelete: (id: string) => void
}

export default function ForceBalanceForm({ forceBalances, onUpsert, onDelete }: ForceBalanceFormProps) {
  const [period, setPeriod] = useState(1)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onUpsert({
      period,
      year: 2026,
      amount: parseFloat(amount),
      reason: reason || undefined,
    })
    setAmount('')
    setReason('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Periode</label>
            <select
              value={period}
              onChange={(e) => setPeriod(parseInt(e.target.value))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  {getPeriodLabel(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Saldo Akhir (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alasan (opsional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Rekonsiliasi bank"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Set Force Balance
        </button>
      </form>

      {forceBalances.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Force Balances Aktif:</h4>
          {forceBalances.map((fb) => (
            <div
              key={fb.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium text-sm">{getPeriodLabel(fb.period)}</p>
                {fb.reason && (
                  <p className="text-xs text-muted-foreground">{fb.reason}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-orange-500">
                  {formatRupiah(fb.amount)}
                </span>
                <button
                  onClick={() => onDelete(fb.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

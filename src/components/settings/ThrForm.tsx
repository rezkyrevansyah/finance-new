'use client'

import { useState } from 'react'
import { formatRupiah, getPeriodLabel } from '@/lib/utils'

interface ThrBonus {
  id: string
  label: string
  period: number
  year: number
  amount: number
}

interface ThrFormProps {
  thrBonuses: ThrBonus[]
  onAdd: (data: { label: string; period: number; year: number; amount: number }) => void
  onDelete: (id: string) => void
}

export default function ThrForm({ thrBonuses, onAdd, onDelete }: ThrFormProps) {
  const [label, setLabel] = useState('')
  const [period, setPeriod] = useState(1)
  const [amount, setAmount] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      label,
      period,
      year: 2026,
      amount: parseFloat(amount),
    })
    setLabel('')
    setAmount('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Label THR</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. THR Lebaran"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          />
        </div>
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
            <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              min="1"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Tambah THR
        </button>
      </form>

      {thrBonuses.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">THR Terdaftar:</h4>
          {thrBonuses.map((thr) => (
            <div
              key={thr.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium text-sm">{thr.label}</p>
                <p className="text-xs text-muted-foreground">
                  Periode {getPeriodLabel(thr.period)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-green-600">
                  {formatRupiah(thr.amount)}
                </span>
                <button
                  onClick={() => onDelete(thr.id)}
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

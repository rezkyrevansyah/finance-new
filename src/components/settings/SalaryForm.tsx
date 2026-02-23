'use client'

import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'

interface SalaryFormProps {
  monthlySalary: number
  initialBalance: number
  onSave: (key: string, value: number) => void
}

export default function SalaryForm({ monthlySalary, initialBalance, onSave }: SalaryFormProps) {
  const [salary, setSalary] = useState(monthlySalary.toString())
  const [balance, setBalance] = useState(initialBalance.toString())

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Gaji Bulanan</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => onSave('monthly_salary', parseFloat(salary))}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Simpan
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Saat ini: {formatRupiah(monthlySalary)}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Saldo Awal (Januari)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => onSave('initial_balance', parseFloat(balance))}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Simpan
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Saat ini: {formatRupiah(initialBalance)}
        </p>
      </div>
    </div>
  )
}

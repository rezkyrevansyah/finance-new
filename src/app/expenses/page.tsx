'use client'

import { useEffect, useState } from 'react'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Expense {
  id: string
  name: string
  amount: number
  period: number
  year: number
  date?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleAdd = () => {
    setSelectedExpense(null)
    setFormOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setFormOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSuccess = (newExpense?: any) => {
    if (newExpense) {
      // Optimistic update for create/update
      setExpenses(prev => {
        const exists = prev.find(e => e.id === newExpense.id)
        if (exists) {
          // Update existing
          return prev.map(e => e.id === newExpense.id ? newExpense : e)
        } else {
          // Add new
          return [newExpense, ...prev]
        }
      })
    } else {
      // Fallback: refetch all
      fetchExpenses()
    }
  }

  const handleDelete = (id: string) => {
    // Optimistic update - remove immediately from UI
    setExpenses(prev => prev.filter(exp => exp.id !== id))
  }

  const handleResetAll = async () => {
    // Optimistic update - clear UI immediately
    setExpenses([])

    try {
      const response = await fetch('/api/expenses', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to reset expenses')
      }

      toast.success('Semua expense berhasil direset')
    } catch (error) {
      console.error('Error resetting expenses:', error)
      toast.error('Gagal mereset expense')
      fetchExpenses()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Expenses
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track dan kelola pengeluaran bulanan Anda
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Expense
        </Button>
      </div>

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetAll={handleResetAll}
      />

      {/* Expense Form Dialog */}
      <ExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={selectedExpense}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

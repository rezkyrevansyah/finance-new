'use client'

import { useEffect, useState } from 'react'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

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
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/expenses')

      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
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

  const handleSuccess = () => {
    fetchExpenses()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Expenses
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your monthly expenses
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
            Expenses
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your monthly expenses
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
        onDelete={handleSuccess}
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

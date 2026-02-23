'use client'

import { useState, Fragment } from 'react'
import { PeriodData } from '@/lib/cashflow'
import { formatRupiah } from '@/lib/utils'
import { ChevronDown, ChevronRight, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'

interface CashFlowTableProps {
  periods: PeriodData[]
  currentPeriod: number
}

export function CashFlowTable({ periods, currentPeriod }: CashFlowTableProps) {
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null)

  const toggleExpand = (period: number) => {
    setExpandedPeriod(expandedPeriod === period ? null : period)
  }

  const getStatus = (period: number) => {
    if (period < currentPeriod) return { label: '✅ Selesai', color: 'bg-green-100 text-green-800' }
    if (period === currentPeriod) return { label: '🟡 Berjalan', color: 'bg-yellow-100 text-yellow-800' }
    return { label: '⏳ Mendatang', color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12"></TableHead>
              <TableHead className="sticky left-0 z-10 bg-gray-50">Periode</TableHead>
              <TableHead>Rentang Tanggal</TableHead>
              <TableHead className="text-right">Saldo Awal</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">End Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => {
              const status = getStatus(period.period)
              const isExpanded = expandedPeriod === period.period
              const isCurrent = period.period === currentPeriod
              const hasExpenses = period.expenses.length > 0

              return (
                <Fragment key={period.period}>
                  <TableRow
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      isCurrent ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => hasExpenses && toggleExpand(period.period)}
                  >
                    <TableCell>
                      {hasExpenses && (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )
                      )}
                    </TableCell>
                    <TableCell className="sticky left-0 z-10 bg-inherit font-medium">
                      {period.label}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {period.dateRange}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(period.startingBalance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {formatRupiah(period.totalIncome)}
                        {period.thrBonus > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            THR
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {period.totalExpenses > 0 ? formatRupiah(period.totalExpenses) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        {formatRupiah(period.displayEndBalance)}
                        {period.isForced && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Lock className="mr-1 h-3 w-3" />
                            Override
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail - Expenses */}
                  {isExpanded && hasExpenses && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-gray-50 p-0">
                        <div className="px-12 py-4">
                          <h4 className="mb-3 text-sm font-semibold text-gray-700">
                            Detail Pengeluaran
                          </h4>
                          <div className="space-y-2">
                            {period.expenses.map((expense) => (
                              <div
                                key={expense.id}
                                className="flex items-center justify-between rounded-lg bg-white p-3 text-sm"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {expense.name}
                                  </p>
                                  {expense.note && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      {expense.note}
                                    </p>
                                  )}
                                </div>
                                <p className="font-semibold text-red-600">
                                  {formatRupiah(expense.amount)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

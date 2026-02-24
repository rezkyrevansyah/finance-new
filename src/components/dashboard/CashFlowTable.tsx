'use client'

import { useState, Fragment } from 'react'
import { PeriodData } from '@/lib/cashflow'
import { formatRupiah } from '@/lib/utils'
import { ChevronDown, ChevronRight, Lock, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
    if (period < currentPeriod) return {
      label: 'Completed',
      color: 'bg-green-500/10 text-green-700 border-green-500/20'
    }
    if (period === currentPeriod) return {
      label: 'Ongoing',
      color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
    }
    return {
      label: 'Upcoming',
      color: 'bg-slate-500/10 text-slate-700 border-slate-500/20'
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Cashflow 2026
        </h2>
        <p className="text-sm text-slate-500">Breakdown periode per bulan</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-12"></th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Periode
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Saldo Awal
              </th>
              <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Income
              </th>
              <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Expenses
              </th>
              <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                End Balance
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => {
              const status = getStatus(period.period)
              const isExpanded = expandedPeriod === period.period
              const isCurrent = period.period === currentPeriod
              const hasExpenses = period.expenses.length > 0
              const hasIncome = period.salary > 0 || period.thrBonus > 0

              return (
                <Fragment key={period.period}>
                  {/* Main Row */}
                  <tr
                    className={`group border-b border-slate-100 ${
                      isCurrent ? 'bg-blue-50' : 'hover:bg-slate-50'
                    } ${hasExpenses ? 'cursor-pointer' : ''}`}
                    onClick={() => hasExpenses && toggleExpand(period.period)}
                  >
                    {/* Expand Icon */}
                    <td className="py-4 px-4">
                      {hasExpenses && (
                        <div className="flex items-center justify-center">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          )}
                        </div>
                      )}
                    </td>

                    {/* Period */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">
                        {period.label}
                      </div>
                    </td>

                    {/* Date Range */}
                    <td className="py-4 px-4">
                      <div className="text-sm text-slate-600">
                        {period.dateRange}
                      </div>
                    </td>

                    {/* Starting Balance */}
                    <td className="py-4 px-4 text-right">
                      <div className="text-sm font-medium text-slate-700">
                        {formatRupiah(period.startingBalance)}
                      </div>
                    </td>

                    {/* Income */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className={`text-sm font-semibold ${hasIncome ? 'text-green-600' : 'text-slate-400'}`}>
                          {formatRupiah(period.totalIncome)}
                        </div>
                        {period.thrBonus > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            +THR
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Expenses */}
                    <td className="py-4 px-4 text-right">
                      <div className={`text-sm font-semibold ${period.totalExpenses > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {formatRupiah(period.totalExpenses)}
                      </div>
                    </td>

                    {/* End Balance */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className={`text-sm font-bold ${
                          period.displayEndBalance > period.startingBalance
                            ? 'text-green-600'
                            : period.displayEndBalance < period.startingBalance
                            ? 'text-red-600'
                            : 'text-slate-700'
                        }`}>
                          {formatRupiah(period.displayEndBalance)}
                        </div>
                        {period.isForced && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Override
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <Badge className={`${status.color} border font-medium`}>
                        {status.label}
                      </Badge>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {isExpanded && hasExpenses && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={8} className="py-4 px-4">
                        <div className="pl-8 pr-4 space-y-3">
                          {/* Income Details */}
                          {hasIncome && (
                            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <h4 className="text-sm font-semibold text-green-900">
                                  Income Details
                                </h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                {period.salary > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-green-700">Salary</span>
                                    <span className="font-semibold text-green-900">
                                      {formatRupiah(period.salary)}
                                    </span>
                                  </div>
                                )}
                                {period.thrBonusItems.map((thr, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-green-700">{thr.label}</span>
                                    <span className="font-semibold text-green-900">
                                      {formatRupiah(thr.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Expense Details */}
                          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <h4 className="text-sm font-semibold text-red-900">
                                Expense Details ({period.expenses.length} items)
                              </h4>
                            </div>
                            <div className="space-y-2">
                              {period.expenses.map((expense) => (
                                <div
                                  key={expense.id}
                                  className="flex justify-between items-start text-sm"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-red-900">
                                      {expense.name}
                                    </div>
                                    {expense.note && (
                                      <div className="text-xs text-red-600 mt-0.5">
                                        {expense.note}
                                      </div>
                                    )}
                                  </div>
                                  <div className="font-semibold text-red-900 ml-4">
                                    {formatRupiah(expense.amount)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Force Balance Reason */}
                          {period.isForced && period.forceReason && (
                            <div className="rounded-lg bg-orange-50 p-4 border border-orange-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Lock className="h-4 w-4 text-orange-600" />
                                <h4 className="text-sm font-semibold text-orange-900">
                                  Override Reason
                                </h4>
                              </div>
                              <p className="text-sm text-orange-700">
                                {period.forceReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

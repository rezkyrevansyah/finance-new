'use client'

import { useState } from 'react'
import { PeriodData } from '@/lib/cashflow'
import { formatRupiah, cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Lock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CashFlowTimelineProps {
  periods: PeriodData[]
  currentPeriod: number
}

export function CashFlowTimeline({ periods, currentPeriod }: CashFlowTimelineProps) {
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(currentPeriod)

  const toggleExpand = (period: number) => {
    setExpandedPeriod(expandedPeriod === period ? null : period)
  }

  const getPeriodState = (period: number): 'past' | 'current' | 'future' => {
    if (period < currentPeriod) return 'past'
    if (period === currentPeriod) return 'current'
    return 'future'
  }

  const getStatusBadge = (period: number) => {
    if (period < currentPeriod) return { label: 'Completed', className: 'bg-green-500/10 text-green-700 border-green-500/20' }
    if (period === currentPeriod) return { label: 'Ongoing', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' }
    return { label: 'Upcoming', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' }
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-200" />

      <div className="space-y-4">
        {periods.map((period) => {
          const state = getPeriodState(period.period)
          const status = getStatusBadge(period.period)
          const isExpanded = expandedPeriod === period.period
          const hasDetails = period.expenses.length > 0 || period.salary > 0 || period.thrBonus > 0
          const balanceIncreased = period.displayEndBalance > period.startingBalance
          const balanceDecreased = period.displayEndBalance < period.startingBalance

          return (
            <div key={period.period} className="relative flex gap-4 items-start">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 flex items-center justify-center mt-4">
                <div
                  className={cn(
                    'rounded-full border-2 border-white',
                    state === 'current' && 'w-5 h-5 bg-blue-500 ring-4 ring-blue-100',
                    state === 'past' && 'w-4 h-4 bg-green-400',
                    state === 'future' && 'w-4 h-4 bg-slate-300',
                  )}
                />
              </div>

              {/* Card */}
              <div
                className={cn(
                  'flex-1 rounded-xl border bg-white shadow-sm overflow-hidden transition-all',
                  state === 'current' && 'border-blue-200 shadow-blue-100/50',
                  state === 'past' && 'border-slate-200',
                  state === 'future' && 'border-slate-100 opacity-70',
                )}
              >
                {/* Left accent bar */}
                <div
                  className={cn(
                    'flex',
                  )}
                >
                  <div
                    className={cn(
                      'w-1 flex-shrink-0',
                      state === 'current' && 'bg-blue-500',
                      state === 'past' && 'bg-green-400',
                      state === 'future' && 'bg-slate-200',
                    )}
                  />

                  <div className="flex-1">
                    {/* Card header */}
                    <button
                      className={cn(
                        'w-full text-left p-4 transition-colors',
                        state === 'current' && 'bg-blue-50/40',
                        hasDetails && 'cursor-pointer hover:bg-slate-50',
                        !hasDetails && 'cursor-default',
                      )}
                      onClick={() => hasDetails && toggleExpand(period.period)}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        {/* Left: period info */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              'text-sm font-bold px-2.5 py-0.5 rounded-full',
                              state === 'current' && 'bg-blue-100 text-blue-800',
                              state === 'past' && 'bg-slate-100 text-slate-700',
                              state === 'future' && 'bg-slate-50 text-slate-500',
                            )}
                          >
                            {period.label}
                          </span>
                          <span className="text-xs text-slate-400">{period.dateRange}</span>
                        </div>

                        {/* Right: status badge + expand indicator */}
                        <div className="flex items-center gap-2">
                          <Badge className={cn('border text-xs font-medium', status.className)}>
                            {status.label}
                          </Badge>
                          {hasDetails && (
                            <span className="text-slate-400">
                              {isExpanded
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Balances summary */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Saldo Awal</p>
                          <p className="text-sm font-medium text-slate-700">
                            {formatRupiah(period.startingBalance)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Income</p>
                          <div className="flex items-center gap-1">
                            <p className={cn(
                              'text-sm font-semibold',
                              period.totalIncome > 0 ? 'text-green-600' : 'text-slate-400'
                            )}>
                              {formatRupiah(period.totalIncome)}
                            </p>
                            {period.thrBonus > 0 && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 py-0 px-1">
                                +THR
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Expenses</p>
                          <p className={cn(
                            'text-sm font-semibold',
                            period.totalExpenses > 0 ? 'text-red-500' : 'text-slate-400'
                          )}>
                            {formatRupiah(period.totalExpenses)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Saldo Akhir</p>
                          <div className="flex items-center gap-1">
                            <p className={cn(
                              'text-sm font-bold',
                              balanceIncreased && 'text-green-600',
                              balanceDecreased && 'text-red-500',
                              !balanceIncreased && !balanceDecreased && 'text-slate-700',
                            )}>
                              {formatRupiah(period.displayEndBalance)}
                            </p>
                            {balanceIncreased && <ArrowUp className="h-3.5 w-3.5 text-green-500" />}
                            {balanceDecreased && <ArrowDown className="h-3.5 w-3.5 text-red-500" />}
                            {period.isForced && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 py-0 px-1 flex items-center gap-0.5">
                                <Lock className="h-2.5 w-2.5" />
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && hasDetails && (
                      <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                        {/* Income Details */}
                        {(period.salary > 0 || period.thrBonus > 0) && (
                          <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                              <h4 className="text-xs font-semibold text-green-900 uppercase tracking-wide">
                                Income Details
                              </h4>
                            </div>
                            <div className="space-y-1.5 text-sm">
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
                        {period.expenses.length > 0 && (
                          <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                              <h4 className="text-xs font-semibold text-red-900 uppercase tracking-wide">
                                Expenses ({period.expenses.length} items)
                              </h4>
                            </div>
                            <div className="space-y-1.5">
                              {period.expenses.map((expense) => (
                                <div
                                  key={expense.id}
                                  className="flex justify-between items-start text-sm"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-red-900">{expense.name}</div>
                                    {expense.note && (
                                      <div className="text-xs text-red-500 mt-0.5">{expense.note}</div>
                                    )}
                                  </div>
                                  <div className="font-semibold text-red-900 ml-4">
                                    {formatRupiah(expense.amount)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Force Balance Reason */}
                        {period.isForced && period.forceReason && (
                          <div className="rounded-lg bg-orange-50 p-3 border border-orange-200">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Lock className="h-3.5 w-3.5 text-orange-600" />
                              <h4 className="text-xs font-semibold text-orange-900 uppercase tracking-wide">
                                Override Reason
                              </h4>
                            </div>
                            <p className="text-sm text-orange-700">{period.forceReason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

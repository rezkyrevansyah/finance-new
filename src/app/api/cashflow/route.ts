import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateAllPeriods } from '@/lib/cashflow'
import { getCurrentPeriod } from '@/lib/utils'

type ConfigRecord = { key: string; value: string | null }
type ThrBonusRecord = { id: string; label: string; period: number; year: number; amount: number }
type ExpenseRecord = { id: string; name: string; amount: number; period: number; year: number; note: string | null }
type ForceBalanceRecord = { id: string; period: number; year: number; amount: number; reason: string | null }

export async function GET() {
  try {
    const [configs, thrBonuses, expenses, forceBalances] = await Promise.all([
      prisma.config.findMany(),
      prisma.thrBonus.findMany({ where: { year: 2026 } }),
      prisma.expense.findMany({ where: { year: 2026 } }),
      prisma.forceBalance.findMany({ where: { year: 2026 } })
    ])

    const salary = Number((configs as ConfigRecord[]).find(c => c.key === 'monthly_salary')?.value || 0)
    const initialBalance = Number((configs as ConfigRecord[]).find(c => c.key === 'initial_balance')?.value || 0)

    const periods = calculateAllPeriods({
      salary,
      initialBalance,
      thrBonuses: (thrBonuses as ThrBonusRecord[]).map(t => ({
        id: t.id,
        label: t.label,
        period: t.period,
        year: t.year,
        amount: t.amount
      })),
      expenses: (expenses as ExpenseRecord[]).map(e => ({
        id: e.id,
        name: e.name,
        amount: e.amount,
        period: e.period,
        year: e.year,
        note: e.note
      })),
      forceBalances: (forceBalances as ForceBalanceRecord[]).map(f => ({
        id: f.id,
        period: f.period,
        year: f.year,
        amount: f.amount,
        reason: f.reason
      })),
      year: 2026
    })

    return NextResponse.json({
      periods,
      currentPeriod: getCurrentPeriod()
    })
  } catch (error) {
    console.error('Cashflow API error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Failed to calculate cashflow', details: message },
      { status: 500 }
    )
  }
}

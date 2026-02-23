import { getPeriodLabel, getPeriodDateRange } from './utils'

export interface PeriodData {
  period: number
  year: number
  label: string
  dateRange: string
  startingBalance: number
  salary: number
  thrBonus: number
  thrBonusItems: { label: string; amount: number }[]
  totalIncome: number
  expenses: { id: string; name: string; amount: number; note?: string | null }[]
  totalExpenses: number
  calculatedEndBalance: number
  isForced: boolean
  forceAmount?: number
  forceReason?: string | null
  displayEndBalance: number
}

interface CalculateAllPeriodsParams {
  salary: number
  initialBalance: number
  thrBonuses: { id: string; label: string; period: number; year: number; amount: number }[]
  expenses: { id: string; name: string; amount: number; period: number; year: number; note?: string | null }[]
  forceBalances: { id: string; period: number; year: number; amount: number; reason?: string | null }[]
  year?: number
}

export function calculateAllPeriods(params: CalculateAllPeriodsParams): PeriodData[] {
  const {
    salary,
    initialBalance,
    thrBonuses,
    expenses,
    forceBalances,
    year = 2026
  } = params

  const periods: PeriodData[] = []

  for (let period = 1; period <= 12; period++) {
    const label = getPeriodLabel(period)
    const dateRange = getPeriodDateRange(period, year)

    // Starting balance
    let startingBalance: number
    if (period === 1) {
      startingBalance = initialBalance
    } else {
      startingBalance = periods[period - 2].displayEndBalance
    }

    // Salary: 0 for period 1, otherwise use params.salary
    const periodSalary = period === 1 ? 0 : salary

    // THR bonuses for this period
    const periodThrBonuses = thrBonuses.filter(t => t.period === period && t.year === year)
    const thrBonusItems = periodThrBonuses.map(t => ({
      label: t.label,
      amount: t.amount
    }))
    const thrBonus = periodThrBonuses.reduce((sum, t) => sum + t.amount, 0)

    // Total income
    const totalIncome = periodSalary + thrBonus

    // Expenses for this period
    const periodExpenses = expenses
      .filter(e => e.period === period && e.year === year)
      .map(e => ({
        id: e.id,
        name: e.name,
        amount: e.amount,
        note: e.note
      }))
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Calculated end balance
    const calculatedEndBalance = startingBalance + totalIncome - totalExpenses

    // Check for forced balance
    const forceBalance = forceBalances.find(fb => fb.period === period && fb.year === year)
    const isForced = !!forceBalance
    const forceAmount = forceBalance?.amount
    const forceReason = forceBalance?.reason

    // Display end balance
    const displayEndBalance = isForced ? (forceAmount ?? calculatedEndBalance) : calculatedEndBalance

    periods.push({
      period,
      year,
      label,
      dateRange,
      startingBalance,
      salary: periodSalary,
      thrBonus,
      thrBonusItems,
      totalIncome,
      expenses: periodExpenses,
      totalExpenses,
      calculatedEndBalance,
      isForced,
      forceAmount,
      forceReason,
      displayEndBalance
    })
  }

  return periods
}

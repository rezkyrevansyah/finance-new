import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Enable dynamic rendering and disable cache for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get('period')
    const yearParam = searchParams.get('year')

    const period = periodParam ? parseInt(periodParam) : null
    const year = yearParam ? parseInt(yearParam) : 2026

    const where: { year: number; period?: number } = { year }

    if (period !== null) {
      where.period = period
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(expenses, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch expenses', details: error },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, amount, period, year, date, note } = body

    if (!name || amount === undefined || !period || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: name, amount, period, year' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (period < 1 || period > 12) {
      return NextResponse.json(
        { error: 'Period must be between 1 and 12' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        name,
        amount,
        period,
        year,
        date: date ? new Date(date) : null,
        note: note || null
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create expense', details: error },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const configs = await prisma.config.findMany()

    const monthlySalary = Number(configs.find(c => c.key === 'monthly_salary')?.value || 0)
    const initialBalance = Number(configs.find(c => c.key === 'initial_balance')?.value || 0)

    return NextResponse.json({
      monthly_salary: monthlySalary,
      initial_balance: initialBalance
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch config', details: error },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || !['monthly_salary', 'initial_balance'].includes(key)) {
      return NextResponse.json(
        { error: 'Invalid key. Must be monthly_salary or initial_balance' },
        { status: 400 }
      )
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      )
    }

    await prisma.config.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    })

    return NextResponse.json({
      success: true,
      key,
      value: String(value)
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update config', details: error },
      { status: 500 }
    )
  }
}

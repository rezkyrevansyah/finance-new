import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const forceBalances = await prisma.forceBalance.findMany({
      where: { year: 2026 }
    })

    return NextResponse.json(forceBalances)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch force balances', details: error },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { period, year, amount, reason } = body

    if (!period || !year || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: period, year, amount' },
        { status: 400 }
      )
    }

    const forceBalance = await prisma.forceBalance.upsert({
      where: {
        period_year: {
          period,
          year
        }
      },
      update: {
        amount,
        reason: reason || null
      },
      create: {
        period,
        year,
        amount,
        reason: reason || null
      }
    })

    return NextResponse.json(forceBalance)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upsert force balance', details: error },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.forceBalance.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete force balance', details: error },
      { status: 500 }
    )
  }
}

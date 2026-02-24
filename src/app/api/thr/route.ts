import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const thrBonuses = await prisma.thrBonus.findMany({
      where: { year: 2026 },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(thrBonuses, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch THR bonuses', details: error },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { label, period, year, amount } = body

    if (!label || !period || !year || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: label, period, year, amount' },
        { status: 400 }
      )
    }

    if (period < 1 || period > 12) {
      return NextResponse.json(
        { error: 'Period must be between 1 and 12' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const thrBonus = await prisma.thrBonus.create({
      data: {
        label,
        period,
        year,
        amount
      }
    })

    return NextResponse.json(thrBonus, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create THR bonus', details: error },
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

    await prisma.thrBonus.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete THR bonus', details: error },
      { status: 500 }
    )
  }
}

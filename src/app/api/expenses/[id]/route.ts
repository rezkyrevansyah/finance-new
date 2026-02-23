import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    const updateData: {
      name?: string
      amount?: number
      period?: number
      year?: number
      date?: Date | null
      note?: string | null
    } = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.amount !== undefined) updateData.amount = body.amount
    if (body.period !== undefined) updateData.period = body.period
    if (body.year !== undefined) updateData.year = body.year
    if (body.date !== undefined) {
      updateData.date = body.date ? new Date(body.date) : null
    }
    if (body.note !== undefined) updateData.note = body.note

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(expense)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update expense', details: error },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.expense.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete expense', details: error },
      { status: 500 }
    )
  }
}

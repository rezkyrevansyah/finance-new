import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    const updateData: {
      name?: string
      price?: number
      targetPeriod?: number | null
      targetYear?: number | null
      isActive?: boolean
      note?: string | null
    } = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.price !== undefined) updateData.price = body.price
    if (body.targetPeriod !== undefined) updateData.targetPeriod = body.targetPeriod
    if (body.targetYear !== undefined) updateData.targetYear = body.targetYear
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.note !== undefined) updateData.note = body.note

    const wishlist = await prisma.wishlist.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(wishlist)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update wishlist item', details: error },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.wishlist.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete wishlist item', details: error },
      { status: 500 }
    )
  }
}

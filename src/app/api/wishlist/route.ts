import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const wishlists = await prisma.wishlist.findMany({
      orderBy: [
        { targetPeriod: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(wishlists)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch wishlist', details: error },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, targetPeriod, targetYear, note } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price' },
        { status: 400 }
      )
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        name,
        price,
        targetPeriod: targetPeriod || null,
        targetYear: targetYear || null,
        note: note || null,
        isActive: true
      }
    })

    return NextResponse.json(wishlist, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create wishlist item', details: error },
      { status: 500 }
    )
  }
}

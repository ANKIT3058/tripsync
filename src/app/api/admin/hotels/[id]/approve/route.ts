import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: params.id }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: params.id },
      data: { approved: true }
    })

    return NextResponse.json({
      message: 'Hotel approved successfully',
      hotel: updatedHotel
    })
  } catch (error) {
    console.error('Approve hotel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: params.id }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: params.id },
      data: { approved: false }
    })

    return NextResponse.json({
      message: 'Hotel approval revoked',
      hotel: updatedHotel
    })
  } catch (error) {
    console.error('Reject hotel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
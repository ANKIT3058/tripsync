import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            suspended: true
          }
        },
        hotel: true,
        room: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Admin booking details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const updateData = await request.json()
    
    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only allow certain fields to be updated
    const allowedFields = ['status', 'errorMessage']
    const filteredUpdate: any = {}
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field]
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: filteredUpdate,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        hotel: {
          select: {
            name: true,
            city: true,
            country: true
          }
        },
        room: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
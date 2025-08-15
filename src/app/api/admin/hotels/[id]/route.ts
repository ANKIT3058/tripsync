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
    const hotel = await prisma.hotel.findUnique({
      where: { id: params.id },
      include: {
        rooms: true,
        bookings: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Admin hotel details error:', error)
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
      data: {
        ...updateData,
        latitude: updateData.latitude ? parseFloat(updateData.latitude) : null,
        longitude: updateData.longitude ? parseFloat(updateData.longitude) : null,
        photos: Array.isArray(updateData.photos) ? updateData.photos : hotel.photos,
        amenities: Array.isArray(updateData.amenities) ? updateData.amenities : hotel.amenities,
      }
    })

    return NextResponse.json({
      message: 'Hotel updated successfully',
      hotel: updatedHotel
    })
  } catch (error) {
    console.error('Update hotel error:', error)
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
      where: { id: params.id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          }
        }
      }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    if (hotel.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete hotel with active bookings' },
        { status: 400 }
      )
    }

    await prisma.hotel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Hotel deleted successfully'
    })
  } catch (error) {
    console.error('Delete hotel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
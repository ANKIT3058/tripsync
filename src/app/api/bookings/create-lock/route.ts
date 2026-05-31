import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRoomLock, checkRoomAvailability } from '@/lib/locks'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { hotelId, roomId, rateId, checkIn, checkOut, guests, price, currency } = await request.json()

    if (!hotelId || !roomId || !rateId || !checkIn || !checkOut || !guests || !price || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      )
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        rooms: {
          where: { id: roomId }
        }
      }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    if (!hotel.approved) {
      return NextResponse.json(
        { error: 'Hotel not available for booking' },
        { status: 400 }
      )
    }

    const room = hotel.rooms[0]
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    const availability = await checkRoomAvailability({
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      excludeUserId: session.user.id!
    })

    if (!availability.available) {
      return NextResponse.json(
        { error: 'Room is not available for the selected dates' },
        { status: 409 }
      )
    }

    const lock = await createRoomLock({
      roomId,
      userId: session.user.id!,
      checkIn: checkInDate,
      checkOut: checkOutDate
    })

    const lockData = {
      id: lock.id,
      roomId: lock.roomId,
      checkIn: lock.checkIn,
      checkOut: lock.checkOut,
      expiresAt: lock.expiresAt,
      hotel: {
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        city: hotel.city,
        country: hotel.country
      },
      room: {
        id: room.id,
        name: room.name,
        capacity: room.capacity
      },
      booking: {
        rateId,
        guests,
        price,
        currency,
        nights: Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)),
        totalAmount: price * Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    return NextResponse.json({
      message: 'Room locked successfully',
      lockId: lock.id,
      expiresAt: lock.expiresAt,
      lock: lockData
    })
  } catch (error) {
    console.error('Create lock error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
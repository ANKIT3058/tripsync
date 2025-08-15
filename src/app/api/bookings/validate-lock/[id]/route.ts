import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateLock } from '@/lib/locks'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const lock = await validateLock(params.id, (session.user as any).id)

    const lockData = {
      id: lock.id,
      roomId: lock.roomId,
      checkIn: lock.checkIn,
      checkOut: lock.checkOut,
      expiresAt: lock.expiresAt,
      hotel: {
        id: lock.room.hotel.id,
        name: lock.room.hotel.name,
        location: lock.room.hotel.location,
        city: lock.room.hotel.city,
        country: lock.room.hotel.country
      },
      room: {
        id: lock.room.id,
        name: lock.room.name,
        capacity: lock.room.capacity
      }
    }

    return NextResponse.json({
      valid: true,
      lock: lockData
    })
  } catch (error) {
    console.error('Validate lock error:', error)
    return NextResponse.json(
      { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Lock validation failed' 
      },
      { status: 400 }
    )
  }
}
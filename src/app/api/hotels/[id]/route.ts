import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHotelDetails } from '@/lib/eps-rapid'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = searchParams.get('guests')

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        rooms: true
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
        { error: 'Hotel not available' },
        { status: 404 }
      )
    }

    let availability = null
    if (checkIn && checkOut && guests) {
      try {
        availability = await getHotelDetails({
          propertyId: hotel.externalId,
          checkIn,
          checkOut,
          guests: parseInt(guests)
        })
      } catch (error) {
        console.error('Error fetching availability:', error)
      }
    }

    const response = {
      ...hotel,
      availability: availability || null
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Hotel details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
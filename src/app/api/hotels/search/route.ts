import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchHotels } from '@/lib/eps-rapid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = searchParams.get('guests')

    if (!location || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const approvedHotels = await prisma.hotel.findMany({
      where: {
        approved: true,
        city: {
          contains: location,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        externalId: true,
        name: true,
        location: true,
        city: true,
        country: true,
        photos: true,
        amenities: true
      }
    })

    console.log('Found hotels in local DB:', approvedHotels);

    const hotelsWithPricing = await Promise.all(
      approvedHotels.map(async (hotel) => {
        try {
          const externalHotels = await searchHotels({
            location: hotel.city,
            checkIn,
            checkOut,
            guests: parseInt(guests),
            limit: 1
          })

          const externalHotel = externalHotels.find(h => h.property_id === hotel.externalId)
          console.log("external hotels: ",externalHotel)


          return {
            ...hotel,
            available: !!externalHotel,
            startingPrice: externalHotel ? 99 : null,
            currency: 'USD',
            rating: externalHotel?.ratings?.guest?.overall || null
          }
        } catch (error) {
          console.error(`Error fetching pricing for hotel ${hotel.id}:`, error)
          return {
            ...hotel,
            available: false,
            startingPrice: null,
            currency: 'USD',
            rating: null
          }
        }
      })
    )

    return NextResponse.json({
      hotels: hotelsWithPricing
    })
  } catch (error) {
    console.error('Hotel search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
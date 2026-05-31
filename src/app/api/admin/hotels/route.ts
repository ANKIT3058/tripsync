import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const approved = searchParams.get('approved')

    const skip = (page - 1) * limit

    const where: Prisma.HotelWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (approved !== null && approved !== '') {
      where.approved = approved === 'true'
    }

    const [hotels, totalCount] = await Promise.all([
      prisma.hotel.findMany({
        where,
        include: {
          rooms: {
            select: {
              id: true
            }
          },
          bookings: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.hotel.count({ where })
    ])

    const hotelsWithStats = hotels.map(hotel => ({
      ...hotel,
      roomCount: hotel.rooms.length,
      bookingCount: hotel.bookings.length,
      activeBookings: hotel.bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length
    }))

    return NextResponse.json({
      hotels: hotelsWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Admin hotels list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const hotelData = await request.json()
    
    const {
      externalId,
      name,
      description,
      location,
      city,
      country,
      address,
      latitude,
      longitude,
      photos,
      amenities
    } = hotelData

    if (!externalId || !name || !location || !city || !country || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existingHotel = await prisma.hotel.findUnique({
      where: { externalId }
    })

    if (existingHotel) {
      return NextResponse.json(
        { error: 'Hotel with this external ID already exists' },
        { status: 409 }
      )
    }

    const hotel = await prisma.hotel.create({
      data: {
        externalId,
        name,
        description,
        location,
        city,
        country,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        photos: Array.isArray(photos) ? photos : [],
        amenities: Array.isArray(amenities) ? amenities : [],
        approved: false
      }
    })

    return NextResponse.json({
      message: 'Hotel created successfully',
      hotel
    })
  } catch (error) {
    console.error('Create hotel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
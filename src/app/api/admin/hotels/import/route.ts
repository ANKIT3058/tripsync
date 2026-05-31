import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { searchHotels, searchRegions } from '@/lib/eps-rapid'

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const { city, limit = 25 } = await request.json()

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      )
    }

    // First, search for the region to get proper region_id
    const regions = await searchRegions(city)
    if (!regions || regions.length === 0) {
      return NextResponse.json(
        { error: 'City not found in EPS Rapid API' },
        { status: 404 }
      )
    }

    const region = regions[0]
    
    // Use dummy dates for hotel discovery
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)

    // Search for hotels in the region
    const externalHotels = await searchHotels({
      location: region.region_id,
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfter.toISOString().split('T')[0],
      guests: 2,
      limit: Math.min(limit, 100) // Cap at 100 hotels per import
    })

    if (!externalHotels || externalHotels.length === 0) {
      return NextResponse.json(
        { error: 'No hotels found for this city' },
        { status: 404 }
      )
    }

    const importResults = {
      imported: 0,
      skipped: 0,
      errors: 0,
      hotels: [] as any[]
    }

    // Process each hotel
    for (const externalHotel of externalHotels) {
      try {
        // Check if hotel already exists
        const existingHotel = await prisma.hotel.findUnique({
          where: { externalId: externalHotel.property_id }
        })

        if (existingHotel) {
          importResults.skipped++
          continue
        }

        // Extract hotel data from EPS response
        const hotelData = {
          externalId: externalHotel.property_id,
          name: externalHotel.name || 'Unknown Hotel',
          description: externalHotel.descriptions?.overview || null,
          location: externalHotel.address?.line_1 || region.name,
          city: externalHotel.address?.city || region.name,
          country: externalHotel.address?.country_code || region.country_code || 'US',
          address: [
            externalHotel.address?.line_1,
            externalHotel.address?.city,
            externalHotel.address?.state_province_code,
            externalHotel.address?.postal_code
          ].filter(Boolean).join(', '),
          latitude: externalHotel.location?.coordinates?.latitude || null,
          longitude: externalHotel.location?.coordinates?.longitude || null,
          photos: externalHotel.images ? externalHotel.images.slice(0, 10).map((img: any) => 
            img.links?.['1000px']?.href || img.links?.['350px']?.href || img.links?.['70px']?.href
          ).filter(Boolean) : [],
          amenities: externalHotel.amenities ? externalHotel.amenities.slice(0, 20).map((amenity: any) => 
            amenity.name
          ).filter(Boolean) : [],
          approved: false // All imported hotels require approval
        }

        // Create hotel in database
        const createdHotel = await prisma.hotel.create({
          data: hotelData
        })

        importResults.imported++
        importResults.hotels.push({
          id: createdHotel.id,
          name: createdHotel.name,
          city: createdHotel.city,
          externalId: createdHotel.externalId
        })

      } catch (error) {
        console.error(`Error importing hotel ${externalHotel.property_id}:`, error)
        importResults.errors++
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      city: region.name,
      regionId: region.region_id,
      results: importResults
    })

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    console.log(`API: Searching regions for query: "${query}"`)

    // Search for regions/cities in EPS Rapid
    const regions = await searchRegions(query.trim())
    
    console.log(`API: Found ${regions.length} regions`)

    return NextResponse.json({
      regions: regions.slice(0, 10).map((region: any) => ({
        id: region.region_id,
        name: region.name,
        country: region.country_code,
        type: region.type
      }))
    })

  } catch (error) {
    console.error('Region search error:', error)
    
    // Return more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Failed to search regions'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
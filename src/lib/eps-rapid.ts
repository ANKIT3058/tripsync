import { EPSHotel, EPSAvailability } from '@/types'

const EPS_BASE_URL = process.env.EPS_RAPID_BASE_URL || 'https://test.ean.com/v3'
const EPS_API_KEY = process.env.EPS_RAPID_API_KEY
const EPS_HOST = process.env.EPS_RAPID_API_HOST

export async function searchHotels(params: {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  limit?: number;
}): Promise<EPSHotel[]> {
  try {
    const queryParams = new URLSearchParams({
      checkin: params.checkIn,
      checkout: params.checkOut,
      occupancy: `${params.guests}`,
      limit: (params.limit || 25).toString(),
      language: 'en-US',
      currency: 'USD',
      country_code: 'US',
      property_set: 'standard',
      include: 'amenities,images,ratings',
      sort: 'distance'
    })

    if (params.location) {
      queryParams.append('region_id', params.location)
    }

    const response = await fetch(`${EPS_BASE_URL}/properties/availability?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `EAN APIKey=${EPS_API_KEY}`,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'TripSync/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }

    const data = await response.json()
    return data.properties || []
  } catch (error) {
    console.error('Error searching hotels:', error)
    throw error
  }
}

export async function getHotelDetails(params: {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}): Promise<EPSAvailability> {
  try {
    const queryParams = new URLSearchParams({
      checkin: params.checkIn,
      checkout: params.checkOut,
      occupancy: `${params.guests}`,
      language: 'en-US',
      currency: 'USD',
      country_code: 'US',
      include: 'rooms,rates,amenities,images,bed_groups,cancel_penalty'
    })

    const response = await fetch(`${EPS_BASE_URL}/properties/${params.propertyId}/availability?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `EAN APIKey=${EPS_API_KEY}`,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'TripSync/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting hotel details:', error)
    throw error
  }
}

export async function searchRegions(query: string) {
  try {
    const queryParams = new URLSearchParams({
      language: 'en-US',
      include: 'standard',
      query: query
    })

    const response = await fetch(`${EPS_BASE_URL}/regions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `EAN APIKey=${EPS_API_KEY}`,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'TripSync/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }

    const data = await response.json()
    return data.regions || []
  } catch (error) {
    console.error('Error searching regions:', error)
    throw error
  }
}
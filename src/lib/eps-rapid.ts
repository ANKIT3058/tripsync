import { EPSHotel, EPSAvailability } from '@/types'

const EPS_BASE_URL = process.env.EPS_RAPID_BASE_URL || 'https://test.ean.com/v3'
const EPS_API_KEY = process.env.EPS_RAPID_API_KEY

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
    // Validate API configuration
    if (!EPS_API_KEY) {
      console.error('EPS_RAPID_API_KEY is not configured')
      throw new Error('EPS Rapid API key is not configured')
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Query parameter is required')
    }

    const queryParams = new URLSearchParams({
      language: 'en-US',
      include: 'standard',
      query: query.trim()
    })

    console.log(`Searching regions for: ${query}`)
    console.log(`EPS API URL: ${EPS_BASE_URL}/regions?${queryParams}`)

    const response = await fetch(`${EPS_BASE_URL}/regions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `EAN APIKey=${EPS_API_KEY}`,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'TripSync/1.0'
      }
    })

    console.log(`EPS API Response Status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`EPS API error response: ${errorText}`)
      throw new Error(`EPS API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`EPS API Response:`, data)
    
    return data.regions || []
  } catch (error) {
    console.error('Error searching regions:', error)
    
    // Return mock data for development/testing if API is not available
    if (process.env.NODE_ENV === 'development' && !EPS_API_KEY) {
      console.log('Returning mock regions data for development')
      return [
        {
          region_id: 'mock_6054439',
          name: query.charAt(0).toUpperCase() + query.slice(1),
          country_code: 'US',
          type: 'city'
        }
      ]
    }
    
    throw error
  }
}
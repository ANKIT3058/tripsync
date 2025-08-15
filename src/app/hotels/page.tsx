'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import SearchForm from '@/components/ui/SearchForm'
import HotelCard from '@/components/ui/HotelCard'

interface Hotel {
  id: string
  name: string
  location: string
  city: string
  country: string
  photos: string[]
  amenities: string[]
  available: boolean
  startingPrice: number | null
  currency: string
  rating: number | null
}

export default function HotelsPage() {
  const searchParams = useSearchParams()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const location = searchParams.get('location') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = parseInt(searchParams.get('guests') || '1')

  const searchHotels = async (filters: {
    location: string
    checkIn: string
    checkOut: string
    guests: number
  }) => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        location: filters.location,
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
        guests: filters.guests.toString()
      })

      const response = await fetch(`/api/hotels/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to search hotels')
      }

      const data = await response.json()
      setHotels(data.hotels || [])
    } catch (error) {
      setError('Failed to load hotels. Please try again.')
      console.error('Error searching hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (location && checkIn && checkOut) {
      searchHotels({ location, checkIn, checkOut, guests })
    }
  }, [location, checkIn, checkOut, guests])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Find Hotels</h1>
          <SearchForm onSearch={searchHotels} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {location && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Hotels in {location}
            </h2>
            <p className="text-gray-600">
              {checkIn && checkOut && (
                <>Check-in: {new Date(checkIn).toLocaleDateString()} • Check-out: {new Date(checkOut).toLocaleDateString()} • {guests} guest{guests !== 1 ? 's' : ''}</>
              )}
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Searching hotels...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && hotels.length === 0 && location && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="mt-2 text-lg text-gray-600">No hotels found for your search criteria</p>
            <p className="text-gray-500">Try adjusting your search parameters</p>
          </div>
        )}

        {!loading && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                id={hotel.id}
                name={hotel.name}
                location={hotel.location}
                city={hotel.city}
                country={hotel.country}
                photos={hotel.photos}
                amenities={hotel.amenities}
                available={hotel.available}
                startingPrice={hotel.startingPrice}
                currency={hotel.currency}
                rating={hotel.rating}
                searchParams={{
                  checkIn,
                  checkOut,
                  guests
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
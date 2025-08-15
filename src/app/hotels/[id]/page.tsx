'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import RoomCard from '@/components/ui/RoomCard'

interface Hotel {
  id: string
  name: string
  description: string
  location: string
  city: string
  country: string
  address: string
  latitude?: number
  longitude?: number
  photos: string[]
  amenities: string[]
  availability?: {
    property_id: string
    rooms: Array<{
      id: string
      name: string
      descriptions?: {
        overview: string
      }
      amenities: Array<{
        id: string
        name: string
      }>
      images: Array<{
        links: {
          '70px': {
            href: string
            method: string
          }
        }
      }>
      bed_groups: Array<{
        id: string
        description: string
        type: string
        beds: Array<{
          type: string
          size: string
          quantity: number
        }>
      }>
      area?: {
        square_meters: number
        square_feet: number
      }
      rates: Array<{
        id: string
        status: string
        available_rooms: number
        refundable: boolean
        occupancy_pricing: Array<{
          totals: {
            inclusive: {
              request_currency: {
                value: string
                currency: string
              }
            }
          }
        }>
        cancel_penalty?: {
          start_datetime: string
          end_datetime: string
          nights: number
          currency: string
          amount: string
        }
      }>
    }>
  }
}

export default function HotelDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = parseInt(searchParams.get('guests') || '1')

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const params = new URLSearchParams()
        if (checkIn) params.append('checkIn', checkIn)
        if (checkOut) params.append('checkOut', checkOut)
        if (guests) params.append('guests', guests.toString())

        const response = await fetch(`/api/hotels/${params.id}?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch hotel details')
        }

        const data = await response.json()
        setHotel(data)
      } catch (error) {
        setError('Failed to load hotel details')
        console.error('Error fetching hotel details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchHotelDetails()
    }
  }, [params.id, checkIn, checkOut, guests])

  const handleBookRoom = async (roomId: string, rateId: string, price: number, currency: string) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates')
      return
    }

    setBookingLoading(true)

    try {
      const response = await fetch('/api/bookings/create-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: hotel?.id,
          roomId,
          rateId,
          checkIn,
          checkOut,
          guests,
          price,
          currency
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking lock')
      }

      router.push(`/bookings/checkout/${data.lockId}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to start booking process')
      console.error('Booking error:', error)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The hotel you are looking for does not exist.'}</p>
            <button
              onClick={() => router.push('/hotels')}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Back to Hotels
            </button>
          </div>
        </div>
      </div>
    )
  }

  const mainImage = hotel.photos[selectedImageIndex] || hotel.photos[0] || '/placeholder-hotel.jpg'
  const availableRooms = hotel.availability?.rooms || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Results
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative">
              <img
                src={mainImage}
                alt={hotel.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-hotel.jpg'
                }}
              />
              {hotel.photos.length > 1 && (
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {hotel.photos.slice(0, 4).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{hotel.name}</h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
              </div>

              {hotel.description && (
                <p className="text-gray-700 mb-6">{hotel.description}</p>
              )}

              {hotel.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Hotel Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {checkIn && checkOut && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Your Stay</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Check-in</span>
                      <div className="font-medium">{new Date(checkIn).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Check-out</span>
                      <div className="font-medium">{new Date(checkOut).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Guests</span>
                      <div className="font-medium">{guests}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Nights</span>
                      <div className="font-medium">
                        {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {availableRooms.length > 0 ? 'Available Rooms' : 'Room Information'}
          </h2>
          
          {!checkIn || !checkOut ? (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-blue-800 font-medium">Select dates to see availability and pricing</h3>
                  <p className="text-blue-700 text-sm mt-1">Please use the search form to check room availability for your dates.</p>
                </div>
              </div>
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="mt-2 text-lg text-gray-600">No rooms available for your selected dates</p>
              <p className="text-gray-500">Try different dates or contact us for assistance</p>
            </div>
          ) : (
            <div className="space-y-6">
              {availableRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBookRoom={handleBookRoom}
                  loading={bookingLoading}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
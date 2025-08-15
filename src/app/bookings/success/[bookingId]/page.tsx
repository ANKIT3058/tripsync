'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Link from 'next/link'

interface BookingDetails {
  id: string
  status: string
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  currency: string
  paymentId: string
  hotel: {
    id: string
    name: string
    location: string
    city: string
    country: string
    address: string
  }
  room: {
    id: string
    name: string
    capacity: number
  }
  user: {
    name: string
    email: string
  }
}

export default function BookingSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const bookingId = params.bookingId as string

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }

        const data = await response.json()
        setBooking(data)
      } catch (error) {
        setError('Failed to load booking details')
        console.error('Error fetching booking details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId, session, router])

  if (!session) {
    return null
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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
            <Link
              href="/bookings"
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              View All Bookings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="inline-block rounded-full h-16 w-16 bg-green-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">Your hotel reservation has been successfully processed.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Booking Details</h2>
            <p className="text-primary-100">Booking ID: {booking.id}</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{booking.hotel.name}</h4>
                    <p className="text-gray-600">{booking.hotel.address}</p>
                    <p className="text-gray-600">{booking.hotel.city}, {booking.hotel.country}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Room</h4>
                    <p className="text-gray-700">{booking.room.name}</p>
                    <p className="text-sm text-gray-600">Capacity: {booking.room.capacity} guests</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Details</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Check-in</h4>
                      <p className="text-gray-700">{new Date(booking.checkIn).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Check-out</h4>
                      <p className="text-gray-700">{new Date(booking.checkOut).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Guests</h4>
                      <p className="text-gray-700">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Nights</h4>
                      <p className="text-gray-700">{nights} night{nights !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                  <p className="text-sm text-gray-600">Payment ID: {booking.paymentId}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${booking.totalAmount} {booking.currency}
                  </div>
                  <div className="text-sm text-green-600 font-medium">✓ Payment Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              A confirmation email has been sent to {booking.user.email}
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              You can view and manage your booking in your account
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Check-in time is typically 3:00 PM at most hotels
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center space-x-4">
          <Link
            href="/bookings"
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
          >
            View All Bookings
          </Link>
          <Link
            href="/hotels"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Book Another Hotel
          </Link>
        </div>
      </main>
    </div>
  )
}
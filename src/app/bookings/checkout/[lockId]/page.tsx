'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import LockTimer from '@/components/ui/LockTimer'

interface LockData {
  id: string
  roomId: string
  checkIn: string
  checkOut: string
  expiresAt: string
  hotel: {
    id: string
    name: string
    location: string
    city: string
    country: string
  }
  room: {
    id: string
    name: string
    capacity: number
  }
  booking?: {
    rateId: string
    guests: number
    price: number
    currency: string
    nights: number
    totalAmount: number
  }
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [lock, setLock] = useState<LockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)

  const lockId = params.lockId as string

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const validateLock = async () => {
      try {
        const response = await fetch(`/api/bookings/validate-lock/${lockId}`)
        const data = await response.json()

        if (!data.valid) {
          throw new Error(data.error || 'Lock validation failed')
        }

        setLock(data.lock)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to validate booking session')
        console.error('Lock validation error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (lockId) {
      validateLock()
    }
  }, [lockId, session, router])

  const handleLockExpired = () => {
    setError('Your booking session has expired. Please start over.')
    setTimeout(() => {
      router.push('/hotels')
    }, 3000)
  }

  const handleExtendLock = async () => {
    try {
      const response = await fetch(`/api/bookings/extend-lock/${lockId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to extend booking time')
      }

      const data = await response.json()
      
      if (lock) {
        setLock({
          ...lock,
          expiresAt: data.expiresAt
        })
      }
    } catch (error) {
      console.error('Extend lock error:', error)
      alert('Failed to extend booking time')
    }
  }

  const handleProceedToPayment = async () => {
    if (!lock?.booking) return

    setProcessingPayment(true)

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lockId: lockId,
          amount: lock.booking.totalAmount,
          currency: lock.booking.currency
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order')
      }

      // Initialize Razorpay checkout (will implement this next)
      // For now, just redirect to a success page
      router.push(`/bookings/payment/${data.orderId}?lockId=${lockId}`)
    } catch (error) {
      console.error('Payment creation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to proceed to payment')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleCancel = async () => {
    try {
      await fetch(`/api/bookings/release-lock/${lockId}`, {
        method: 'DELETE'
      })
      router.push('/hotels')
    } catch (error) {
      console.error('Cancel booking error:', error)
      router.push('/hotels')
    }
  }

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

  if (error || !lock) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Session Error</h1>
            <p className="text-gray-600 mb-6">{error || 'Invalid or expired booking session.'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your booking details and proceed to payment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <LockTimer
              expiresAt={lock.expiresAt}
              onExpired={handleLockExpired}
              onExtend={handleExtendLock}
            />

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{lock.hotel.name}</h3>
                  <p className="text-gray-600">{lock.hotel.city}, {lock.hotel.country}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Room</h4>
                  <p className="text-gray-700">{lock.room.name}</p>
                  <p className="text-sm text-gray-600">Capacity: {lock.room.capacity} guests</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Check-in</h4>
                    <p className="text-gray-700">{new Date(lock.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Check-out</h4>
                    <p className="text-gray-700">{new Date(lock.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>

                {lock.booking && (
                  <div>
                    <h4 className="font-medium text-gray-900">Guests</h4>
                    <p className="text-gray-700">{lock.booking.guests} guest{lock.booking.guests !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    defaultValue={session.user?.name?.split(' ')[0] || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    defaultValue={session.user?.name?.split(' ').slice(1).join(' ') || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue={session.user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Summary</h2>
              
              {lock.booking && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room rate (per night)</span>
                    <span className="font-medium">${lock.booking.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of nights</span>
                    <span className="font-medium">{lock.booking.nights}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary-600">${lock.booking.totalAmount}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleProceedToPayment}
                  disabled={processingPayment}
                  className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {processingPayment ? 'Processing...' : 'Proceed to Payment'}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>• Free cancellation until payment</p>
                <p>• Secure payment processing</p>
                <p>• Instant booking confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
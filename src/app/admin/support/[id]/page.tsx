'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

interface BookingDetails {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED'
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  currency: string
  paymentId?: string
  razorpayOrderId?: string
  externalBookingId?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    suspended: boolean
  }
  hotel: {
    id: string
    externalId: string
    name: string
    location: string
    city: string
    country: string
    address: string
  }
  room: {
    id: string
    externalRoomId: string
    name: string
    capacity: number
  }
}

export default function AdminSupportDetailsPage() {
  const params = useParams()
  const router = useRouter()
  
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const bookingId = params.id as string

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/admin/bookings/${bookingId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }

        const data = await response.json()
        setBooking(data)
        setRefundAmount(data.totalAmount.toString())
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
  }, [bookingId])

  const handleConfirmBooking = async () => {
    if (!booking) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CONFIRMED',
          errorMessage: null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to confirm booking')
      }

      const data = await response.json()
      setBooking(data.booking)
      alert('Booking confirmed successfully!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setUpdating(false)
    }
  }

  const handleRefund = async () => {
    if (!booking || !booking.paymentId) return

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0 || amount > booking.totalAmount) {
      alert('Please enter a valid refund amount')
      return
    }

    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund')
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason: refundReason
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process refund')
      }

      const data = await response.json()
      setBooking(data.booking)
      alert(`Refund of $${amount} processed successfully!`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Refund failed')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      FAILED: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout title="Resolve Booking Issue">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !booking) {
    return (
      <AdminLayout title="Resolve Booking Issue">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/admin/support')}
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Support
          </button>
        </div>
      </AdminLayout>
    )
  }

  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <AdminLayout title="Resolve Booking Issue">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <button
            onClick={() => router.push('/admin/support')}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Support
          </button>
          
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.id.substring(0, 8)}</h1>
            <div className="mt-2">{getStatusBadge(booking.status)}</div>
          </div>
        </div>

        {booking.status === 'FAILED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Booking Failed</h3>
                {booking.errorMessage && (
                  <p className="text-red-800 mb-4">{booking.errorMessage}</p>
                )}
                <div className="space-y-2 text-sm text-red-800">
                  <div>• This booking requires manual intervention</div>
                  {booking.paymentId && <div>• Payment was captured successfully</div>}
                  <div>• User may need assistance or refund</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Hotel & Room</h3>
                <div className="text-gray-700">
                  <div className="font-medium">{booking.hotel.name}</div>
                  <div className="text-sm text-gray-600">{booking.room.name}</div>
                  <div className="text-sm text-gray-600">{booking.hotel.address}</div>
                  <div className="text-sm text-gray-600">{booking.hotel.city}, {booking.hotel.country}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Check-in</h4>
                  <p className="text-gray-700">{new Date(booking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Check-out</h4>
                  <p className="text-gray-700">{new Date(booking.checkOut).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Guests</h4>
                  <p className="text-gray-700">{booking.guests}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Nights</h4>
                  <p className="text-gray-700">{nights}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Total Amount</h4>
                <p className="text-xl font-bold text-gray-900">${booking.totalAmount} {booking.currency}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900">Created</h4>
                  <p className="text-gray-600">{formatDate(booking.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Last Updated</h4>
                  <p className="text-gray-600">{formatDate(booking.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer & Payment Info</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Customer</h3>
                <div>
                  <div className="font-medium text-gray-900">{booking.user.name}</div>
                  <div className="text-gray-600">{booking.user.email}</div>
                  {booking.user.suspended && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Account Suspended
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  {booking.razorpayOrderId && (
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <span className="ml-2 font-mono text-gray-900">{booking.razorpayOrderId}</span>
                    </div>
                  )}
                  {booking.paymentId && (
                    <div>
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="ml-2 font-mono text-gray-900">{booking.paymentId}</span>
                    </div>
                  )}
                  {booking.externalBookingId && (
                    <div>
                      <span className="text-gray-600">External Booking:</span>
                      <span className="ml-2 font-mono text-gray-900">{booking.externalBookingId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">External Links</h3>
                <div className="space-y-2">
                  <a
                    href={`https://dashboard.razorpay.com/app/payments/${booking.paymentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    View in Razorpay Dashboard
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Resolution Actions</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {booking.status === 'FAILED' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Manual Confirmation</h3>
                <p className="text-sm text-gray-600">
                  If this booking should be valid, you can manually confirm it. This will mark the booking as confirmed 
                  and clear any error messages.
                </p>
                <button
                  onClick={handleConfirmBooking}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            )}

            {booking.paymentId && booking.status !== 'CANCELLED' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Process Refund</h3>
                <p className="text-sm text-gray-600">
                  Issue a full or partial refund to the customer via Razorpay.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={booking.totalAmount}
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: ${booking.totalAmount}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Refund
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={3}
                      placeholder="Enter reason for refund..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleRefund}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {updating ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
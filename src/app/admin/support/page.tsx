'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

interface Booking {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED'
  checkIn: string
  checkOut: string
  totalAmount: number
  currency: string
  paymentId?: string
  razorpayOrderId?: string
  errorMessage?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  hotel: {
    id: string
    name: string
    city: string
    country: string
  }
  room: {
    id: string
    name: string
  }
}

export default function AdminSupportPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('FAILED')
  const [showIssuesOnly, setShowIssuesOnly] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [currentPage, searchQuery, statusFilter, showIssuesOnly])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter) params.append('status', statusFilter)
      if (showIssuesOnly) params.append('issues', 'true')

      const response = await fetch(`/api/admin/bookings?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data.bookings)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      setError('Failed to load bookings')
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  const getIssueSeverity = (booking: Booking) => {
    if (booking.status === 'FAILED' && booking.paymentId) {
      return { level: 'high', text: 'Payment succeeded but booking failed', color: 'text-red-600' }
    }
    if (booking.status === 'FAILED') {
      return { level: 'medium', text: 'Booking failed', color: 'text-orange-600' }
    }
    if (booking.errorMessage) {
      return { level: 'low', text: 'Has error message', color: 'text-yellow-600' }
    }
    return { level: 'none', text: 'No issues', color: 'text-gray-600' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout title="Support & Issue Resolution">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Issue Resolution Tools</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border">
              <h3 className="font-medium text-gray-900 mb-2">Manual Confirmation</h3>
              <p className="text-sm text-gray-600 mb-3">Manually confirm failed bookings that should be valid</p>
              <div className="text-xs text-gray-500">Available in booking details</div>
            </div>
            <div className="bg-white p-4 rounded-md border">
              <h3 className="font-medium text-gray-900 mb-2">Refund Processing</h3>
              <p className="text-sm text-gray-600 mb-3">Issue refunds for problematic bookings via Razorpay</p>
              <div className="text-xs text-gray-500">Integrated with payment gateway</div>
            </div>
            <div className="bg-white p-4 rounded-md border">
              <h3 className="font-medium text-gray-900 mb-2">External Dashboard</h3>
              <p className="text-sm text-gray-600 mb-3">Access Razorpay dashboard for payment details</p>
              <a
                href="https://dashboard.razorpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Open Razorpay Dashboard →
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="text"
                placeholder="Search bookings, users, or hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showIssuesOnly}
                  onChange={(e) => setShowIssuesOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Issues only</span>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!loading && bookings.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="mt-2 text-lg text-gray-600">No issues found!</p>
                <p className="text-gray-500">All bookings are running smoothly</p>
              </div>
            )}

            {!loading && bookings.length > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    const issue = getIssueSeverity(booking)
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.hotel.name}</div>
                            <div className="text-sm text-gray-500">
                              {booking.room.name} • {booking.hotel.city}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {booking.id.substring(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                            <div className="text-sm text-gray-500">{booking.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {getStatusBadge(booking.status)}
                            <div className={`text-xs ${issue.color}`}>
                              {issue.text}
                            </div>
                            {booking.errorMessage && (
                              <div className="text-xs text-red-600 max-w-xs truncate" title={booking.errorMessage}>
                                {booking.errorMessage}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${booking.totalAmount}</div>
                          <div className="text-xs text-gray-500">{booking.currency}</div>
                          {booking.paymentId && (
                            <div className="text-xs text-green-600">Payment captured</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Link
                            href={`/admin/support/${booking.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Resolve
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-md ${
                      page === currentPage
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
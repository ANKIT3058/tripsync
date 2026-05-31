'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
// --- 1. Import necessary icons ---
import {
  Search, XCircle, AlertTriangle, LoaderCircle, ServerCrash, Inbox,
  ChevronLeft, ChevronRight, ShieldAlert, CheckCircle2, ArrowRight
} from 'lucide-react'

// --- Interface remains the same ---
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
  return (
    <AdminLayout title="Support & Issue Resolution">
      <Suspense fallback={<SupportSkeleton />}>
        <AdminSupportContent />
      </Suspense>
    </AdminLayout>
  )
}

function SupportSkeleton() {
  return (
    <div className="text-center py-20 flex flex-col items-center">
      <LoaderCircle className="animate-spin h-10 w-10 text-indigo-500" />
      <p className="mt-4 text-slate-500">Loading support dashboard...</p>
    </div>
  )
}

function AdminSupportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // --- 2. State management with URL synchronization ---
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'FAILED')
  const [showIssuesOnly, setShowIssuesOnly] = useState(searchParams.get('issues') !== 'false')
  
  // --- 3. Debounced search for performance ---
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery)
      if (statusFilter) params.append('status', statusFilter)
      if (showIssuesOnly) params.append('issues', 'true')
      
      router.push(`/admin/support?${params.toString()}`, { scroll: false })

      const response = await fetch(`/api/admin/bookings?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      
      const data = await response.json()
      setBookings(data.bookings)
      setTotalPages(data.pagination.totalPages)
      setError('')
    } catch {
      setError('Failed to load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearchQuery, statusFilter, showIssuesOnly, router])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // --- 4. Restyled status and issue badges ---
  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      CANCELLED: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    }
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
  }

  const getIssueSeverity = (booking: Booking) => {
    if (booking.status === 'FAILED' && booking.paymentId) {
      return { icon: AlertTriangle, text: 'Payment captured, booking failed', color: 'text-red-600 dark:text-red-400' }
    }
    if (booking.status === 'FAILED') {
      return { icon: XCircle, text: 'Booking failed', color: 'text-orange-600 dark:text-orange-400' }
    }
    if (booking.errorMessage) {
      return { icon: AlertTriangle, text: 'Has error message', color: 'text-yellow-600 dark:text-yellow-400' }
    }
    return { icon: CheckCircle2, text: 'No issues detected', color: 'text-green-600 dark:text-green-400' }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  // --- 5. Reusable Pagination component ---
  const Pagination = () => (
    <div className="px-6 py-4 border-t dark:border-slate-700 flex items-center justify-between">
      <span className="text-sm text-slate-600 dark:text-slate-400">Page {currentPage} of {totalPages}</span>
      <nav className="flex items-center space-x-2">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition">
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  )

  return (
    <div className="space-y-6">
        {/* --- 6. Redesigned header/info card --- */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">Issue Resolution Center</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                This dashboard automatically flags bookings that require manual attention. Focus on &apos;Failed&apos; bookings, especially those where a payment was captured.
              </p>
            </div>
          </div>
        </div>

        {/* --- 7. Main content card with filters and table --- */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b dark:border-slate-700">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Bookings Queue</h3>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input type="text" placeholder="Search by user, hotel, ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 transition" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 transition">
                  <option value="">All Statuses</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                </select>
                <label className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={showIssuesOnly} onChange={(e) => setShowIssuesOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  Show issues only
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-20 flex flex-col items-center"><LoaderCircle className="animate-spin h-10 w-10 text-indigo-500" /><p className="mt-4 text-slate-500">Loading bookings...</p></div>
            ) : error ? (
              <div className="text-center py-20 flex flex-col items-center m-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-6"><ServerCrash className="h-10 w-10" /><p className="mt-4 font-semibold">{error}</p></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center"><Inbox className="h-10 w-10 text-slate-400" /><p className="mt-4 text-slate-500">No bookings found for the selected filters.</p></div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    {['Booking', 'User', 'Issue Details', 'Amount', 'Date'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {bookings.map((booking) => {
                    const issue = getIssueSeverity(booking);
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-slate-200">{booking.hotel.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{booking.room.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-slate-200">{booking.user.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{booking.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(booking.status)}
                            <div className={`flex items-center gap-1.5 text-sm font-medium ${issue.color}`}>
                              <issue.icon size={16} />
                              <span>{issue.text}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-slate-200">{new Intl.NumberFormat('en-US', { style: 'currency', currency: booking.currency }).format(booking.totalAmount)}</div>
                          {booking.paymentId && <div className="text-xs font-medium text-green-600 dark:text-green-400">Paid</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{formatDate(booking.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link href={`/admin/support/${booking.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white font-semibold text-sm rounded-md hover:bg-indigo-700 transition-colors">
                            Resolve <ArrowRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          {!loading && !error && bookings.length > 0 && totalPages > 1 && <Pagination />}
        </div>
    </div>
  )
}

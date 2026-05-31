'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
// --- 1. Import necessary icons ---
import {
  Search, Plus, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight,
  LoaderCircle, ServerCrash, Inbox, BedDouble, CalendarDays, BarChart2
} from 'lucide-react'

// --- Interface remains the same ---
interface Hotel {
  id: string
  externalId: string
  name: string
  location: string
  city: string
  country: string
  approved: boolean
  createdAt: string
  roomCount: number
  bookingCount: number
  activeBookings: number
}

export default function AdminHotelsPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="Hotel Management">
        <div className="flex items-center justify-center py-20">
          <LoaderCircle className="animate-spin h-10 w-10 text-indigo-500" />
        </div>
      </AdminLayout>
    }>
      <AdminHotelsPageContent />
    </Suspense>
  )
}

function AdminHotelsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // --- State management with URL synchronization ---
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [approvedFilter, setApprovedFilter] = useState(searchParams.get('approved') || '')

  // --- 2. Debounced search to prevent excessive API calls ---
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [searchQuery]);


  // --- 3. Centralized fetching logic with useCallback for performance ---
  const fetchHotels = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery)
      if (approvedFilter) params.append('approved', approvedFilter)
      
      // Update URL search params without reloading the page
      router.push(`/admin/hotels?${params.toString()}`, { scroll: false })

      const response = await fetch(`/api/admin/hotels?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch hotels')

      const data = await response.json()
      setHotels(data.hotels)
      setTotalPages(data.pagination.totalPages)
      setError('')
    } catch (err) {
      setError('Failed to load hotels. Please try again later.')
      console.error('Error fetching hotels:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearchQuery, approvedFilter, router])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  const handleApproveHotel = async (hotelId: string, approve: boolean) => {
    // Basic confirmation dialog
    const action = approve ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this hotel?`)) {
        return;
    }
    
    try {
      const response = await fetch(`/api/admin/hotels/${hotelId}/approve`, {
        method: approve ? 'POST' : 'DELETE'
      })
      if (!response.ok) throw new Error(`Failed to ${action} hotel`)
      fetchHotels() // Re-fetch to update the list
    } catch (err) {
      // Replace alert with a more modern notification system in a real app
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  }

  // --- 4. Restyled status badges with dark mode support ---
  const getStatusBadge = (approved: boolean) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1"
    if (approved) {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`}>
          <CheckCircle size={14} /> Approved
        </span>
      )
    }
    return (
      <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300`}>
        Pending
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  // --- 5. Pagination component for cleaner rendering ---
  const Pagination = () => (
    <div className="px-6 py-4 border-t dark:border-slate-700 flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
        </span>
        <nav className="flex items-center space-x-2">
            <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={18} />
            </button>
        </nav>
    </div>
  )

  return (
    <AdminLayout title="Hotel Management">
      {/* --- 6. Main card with improved styling and dark mode --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        {/* --- 7. Restyled header with icons and better layout --- */}
        <div className="p-6 border-b dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 transition"
                />
              </div>
              <select
                value={approvedFilter}
                onChange={(e) => setApprovedFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 transition"
              >
                <option value="">All Statuses</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
            </div>
            <Link href="/admin/hotels/add" className="w-full md:w-auto">
              <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus size={18} /> Add Hotel
              </button>
            </Link>
          </div>
        </div>

        {/* --- 8. Improved loading, error, and empty states --- */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <LoaderCircle className="animate-spin h-10 w-10 text-indigo-500" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">Loading hotels...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 flex flex-col items-center justify-center m-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-6">
              <ServerCrash className="h-10 w-10" />
              <p className="mt-4 font-semibold">{error}</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <Inbox className="h-10 w-10 text-slate-400" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">No hotels found for the selected filters.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['Hotel', 'Location', 'Status', 'Stats', 'Created', 'Actions'].map(header => (
                    <th key={header} className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${header === 'Actions' ? 'text-right' : ''}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">{hotel.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">ID: {hotel.externalId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800 dark:text-slate-300">{hotel.city}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{hotel.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(hotel.approved)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5"><BedDouble size={14} /> {hotel.roomCount} rooms</div>
                      <div className="flex items-center gap-1.5"><BarChart2 size={14} /> {hotel.activeBookings} active</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(hotel.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/hotels/${hotel.id}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"><Eye size={18} /></Link>
                        {hotel.approved ? (
                          <button onClick={() => handleApproveHotel(hotel.id, false)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"><XCircle size={18} /></button>
                        ) : (
                          <button onClick={() => handleApproveHotel(hotel.id, true)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"><CheckCircle size={18} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && hotels.length > 0 && totalPages > 1 && <Pagination />}
      </div>
    </AdminLayout>
  )
}

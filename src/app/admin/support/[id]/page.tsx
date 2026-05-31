'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
// --- 1. Import a comprehensive set of icons ---
import {
  ArrowLeft, AlertTriangle, LoaderCircle, Calendar, Users,
  Moon, Hotel, User, Mail, CreditCard, Hash, ExternalLink, MessageSquare, ShieldCheck,
  RotateCcw, Wallet
} from 'lucide-react'

// --- Interface remains the same ---
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
    address: string
    city: string
    country: string
  }
  room: {
    id: string
    externalRoomId: string
    name: string
    capacity: number
  }
}

// --- Reusable component for displaying details ---
const DetailItem = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
  <div>
    <dt className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
      <Icon className="h-4 w-4 mr-2" />
      <span>{label}</span>
    </dt>
    <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200 sm:mt-0 sm:col-span-2">{children}</dd>
  </div>
);

export default function AdminSupportDetailsPage() {
  const params = useParams()
  const router = useRouter()
  
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  // --- 2. State for a non-blocking notification system (replaces alert()) ---
  const [notification, setNotification] = useState({ message: '', type: '', visible: false })

  const bookingId = params.id as string

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, visible: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }))
    }, 4000)
  }

  const fetchBookingDetails = useCallback(async () => {
    if (!bookingId) return;
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`)
      if (!response.ok) throw new Error('Failed to fetch booking details')
      const data = await response.json()
      setBooking(data)
      setRefundAmount(data.totalAmount.toString())
    } catch {
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchBookingDetails()
  }, [fetchBookingDetails])

  const handleConfirmBooking = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED', errorMessage: null }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to confirm booking')
      setBooking(data.booking)
      showNotification('Booking confirmed successfully!', 'success')
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Operation failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleRefund = async () => {
    if (!booking?.paymentId) return;
    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0 || amount > booking.totalAmount) {
      return showNotification('Please enter a valid refund amount', 'error')
    }
    if (!refundReason.trim()) {
      return showNotification('Please provide a reason for the refund', 'error')
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason: refundReason }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to process refund')
      setBooking(data.booking)
      showNotification(`Refund of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: booking.currency }).format(amount)} processed!`, 'success')
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Refund failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  // --- 3. Restyled status badges with icons and dark mode support ---
  const getStatusBadge = (status: BookingDetails['status']) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      CANCELLED: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    }
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full inline-block ${styles[status]}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  // --- 4. Improved loading and error states ---
  if (loading) {
    return (
      <AdminLayout title="Loading Booking...">
        <div className="flex items-center justify-center py-20">
          <LoaderCircle className="h-12 w-12 animate-spin text-indigo-500" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !booking) {
    return (
      <AdminLayout title="Error">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-4">Booking Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
          <button onClick={() => router.push('/admin/support')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">
            Back to Support
          </button>
        </div>
      </AdminLayout>
    )
  }
  
  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <AdminLayout title={`Resolve Booking #${booking.id.substring(0, 8)}`}>
      {/* --- 5. The new notification component --- */}
      {notification.visible && (
        <div className={`fixed top-24 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-transform duration-300 translate-x-0 z-50`}>
          {notification.message}
        </div>
      )}

      <div className="space-y-6">
        {/* --- 6. Redesigned Page Header --- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <button onClick={() => router.push('/admin/support')} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            <ArrowLeft size={16} /> Back to Support
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Booking #{booking.id.substring(0, 8)}
            </h1>
            {getStatusBadge(booking.status)}
          </div>
        </div>
        
        {/* --- 7. Restyled 'Failed' banner --- */}
        {booking.status === 'FAILED' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg p-5">
            <div className="flex">
              <div className="flex-shrink-0"><AlertTriangle className="h-6 w-6 text-red-500" /></div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">Action Required: Booking Failed</h3>
                <div className="mt-2 text-sm text-red-800 dark:text-red-200">
                  <p>{booking.errorMessage || 'An unknown error caused this booking to fail. Manual intervention is required.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 8. Main layout grid with details and actions --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Booking Summary</h2></div>
              <dl className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <DetailItem icon={Calendar} label="Check-in">{new Date(booking.checkIn).toLocaleDateString()}</DetailItem>
                <DetailItem icon={Calendar} label="Check-out">{new Date(booking.checkOut).toLocaleDateString()}</DetailItem>
                <DetailItem icon={Moon} label="Nights">{nights}</DetailItem>
                <DetailItem icon={Users} label="Guests">{booking.guests}</DetailItem>
                <DetailItem icon={Wallet} label="Total Amount">
                  <span className="font-bold text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: booking.currency }).format(booking.totalAmount)}</span>
                </DetailItem>
              </dl>
            </div>

            {/* Hotel & Customer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Hotel & Room</h2></div>
                <div className="p-6 space-y-4">
                  <DetailItem icon={Hotel} label="Hotel">{booking.hotel.name}</DetailItem>
                  <DetailItem icon={MessageSquare} label="Room">{booking.room.name}</DetailItem>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Customer</h2></div>
                <div className="p-6 space-y-4">
                  <DetailItem icon={User} label="Name">{booking.user.name}</DetailItem>
                  <DetailItem icon={Mail} label="Email">{booking.user.email}</DetailItem>
                </div>
              </div>
            </div>
          </div>
          
          {/* --- 9. Actions column --- */}
          <div className="space-y-6">
            {/* Resolution Actions Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Resolution Actions</h2></div>
              <div className="p-6 space-y-6">
                {booking.status === 'FAILED' && (
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2"><ShieldCheck size={18}/> Manual Confirmation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-4">Manually mark this booking as confirmed. This should only be done after verifying the payment and availability.</p>
                    <button onClick={handleConfirmBooking} disabled={updating} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
                      {updating ? <LoaderCircle className="animate-spin"/> : 'Confirm Booking'}
                    </button>
                  </div>
                )}

                {booking.paymentId && booking.status !== 'CANCELLED' && (
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2"><RotateCcw size={18}/> Process Refund</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Refund Amount ({booking.currency})</label>
                        <input type="number" min="0" max={booking.totalAmount} step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Refund</label>
                        <textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={3} placeholder="e.g., Customer request" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white" />
                      </div>
                      <button onClick={handleRefund} disabled={updating} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
                        {updating ? <LoaderCircle className="animate-spin"/> : 'Process Refund'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Payment Details</h2></div>
                <div className="p-6 space-y-4">
                    {booking.razorpayOrderId && <DetailItem icon={Hash} label="Order ID">{booking.razorpayOrderId}</DetailItem>}
                    {booking.paymentId && <DetailItem icon={CreditCard} label="Payment ID">{booking.paymentId}</DetailItem>}
                    {booking.paymentId &&
                        <a href={`https://dashboard.razorpay.com/app/payments/${booking.paymentId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            View on Razorpay <ExternalLink size={14} />
                        </a>
                    }
                </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

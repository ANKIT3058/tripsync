'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const orderId = params.orderId as string
  const lockId = searchParams.get('lockId')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
    }

    const initializePayment = async () => {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please refresh the page.')
        setLoading(false)
        return
      }

      if (!orderId) {
        setError('Invalid payment session')
        setLoading(false)
        return
      }

      setLoading(false)
      handlePayment()
    }

    initializePayment()
  }, [session, orderId, router])

  const handlePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lockId,
          amount: 100, // This should come from the lock data
          currency: 'USD'
        }),
      })

      const orderData = await response.json()

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create payment order')
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TripSync',
        description: 'Hotel Booking Payment',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          await verifyPayment(response)
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false)
            setError('Payment was cancelled')
          }
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment initialization failed')
      setProcessing(false)
    }
  }

  const verifyPayment = async (response: any) => {
    try {
      const verificationResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          lockId
        }),
      })

      const verificationData = await verificationResponse.json()

      if (!verificationResponse.ok) {
        throw new Error(verificationData.error || 'Payment verification failed')
      }

      router.push(`/bookings/success/${verificationData.booking.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment verification failed')
      setProcessing(false)
    }
  }

  const handleRetry = () => {
    setError('')
    handlePayment()
  }

  const handleCancel = () => {
    if (lockId) {
      fetch(`/api/bookings/release-lock/${lockId}`, { method: 'DELETE' })
    }
    router.push('/hotels')
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {loading && (
            <div>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Initializing Payment</h1>
              <p className="text-gray-600">Please wait while we set up your payment...</p>
            </div>
          )}

          {processing && (
            <div>
              <div className="inline-block animate-pulse rounded-full h-16 w-16 bg-primary-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
              <p className="text-gray-600">Please complete the payment in the popup window...</p>
            </div>
          )}

          {error && (
            <div>
              <div className="inline-block rounded-full h-16 w-16 bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
                >
                  Retry Payment
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          )}

          {!loading && !processing && !error && (
            <div>
              <div className="inline-block rounded-full h-16 w-16 bg-primary-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready for Payment</h1>
              <p className="text-gray-600 mb-6">Click the button below to proceed with your payment</p>
              <button
                onClick={handlePayment}
                className="px-8 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Pay Now
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>🔒 Your payment is secured by Razorpay</p>
          <p className="mt-2">We accept all major credit cards and debit cards</p>
        </div>
      </main>
    </div>
  )
}
import Razorpay from 'razorpay'
import crypto from 'crypto'

let razorpayClient: Razorpay | null = null

/**
 * Lazily initialize the Razorpay SDK.
 *
 * The client is created on first use (inside a request handler) rather than at
 * module import time. This prevents the constructor from throwing
 * "`key_id` or `oauthToken` is mandatory" during the Next.js build's
 * "Collecting page data" phase, where the env vars may not be present.
 */
function getRazorpayClient(): Razorpay {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Missing Razorpay environment variables')
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }

  return razorpayClient
}

export interface RazorpayOrderData {
  amount: number
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder(data: RazorpayOrderData) {
  try {
    const options = {
      amount: Math.round(data.amount * 100), // Convert to paise (smallest currency unit)
      currency: data.currency,
      receipt: data.receipt,
      notes: data.notes || {},
    }

    const order = await getRazorpayClient().orders.create(options)
    return order
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    throw new Error('Failed to create payment order')
  }
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const text = orderId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex')

    return expectedSignature === signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function getRazorpayPayment(paymentId: string) {
  try {
    const payment = await getRazorpayClient().payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Error fetching payment details:', error)
    throw new Error('Failed to fetch payment details')
  }
}

export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const refundData: { amount?: number } = {}
    if (amount) {
      refundData.amount = Math.round(amount * 100) // Convert to paise
    }

    const refund = await getRazorpayClient().payments.refund(paymentId, refundData)
    return refund
  } catch (error) {
    console.error('Refund error:', error)
    throw new Error('Failed to process refund')
  }
}
import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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

    const order = await razorpay.orders.create(options)
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
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Error fetching payment details:', error)
    throw new Error('Failed to fetch payment details')
  }
}

export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const refundData: any = {}
    if (amount) {
      refundData.amount = Math.round(amount * 100) // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData)
    return refund
  } catch (error) {
    console.error('Refund error:', error)
    throw new Error('Failed to process refund')
  }
}
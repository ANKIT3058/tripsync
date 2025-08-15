import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { releaseLock } from '@/lib/locks'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    const isValidSignature = expectedSignature === signature

    if (!isValidSignature) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        razorpayOrderId: payment.order_id
      }
    })

    if (!booking) {
      console.error(`Booking not found for order ${payment.order_id}`)
      return
    }

    if (booking.status !== 'CONFIRMED') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paymentId: payment.id,
        }
      })

      console.log(`Booking ${booking.id} confirmed via webhook`)
    }

    // Try to release any associated lock
    if (payment.notes?.lockId) {
      try {
        await releaseLock(payment.notes.lockId)
      } catch (error) {
        console.error('Error releasing lock via webhook:', error)
      }
    }
  } catch (error) {
    console.error('Error handling payment captured:', error)
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        razorpayOrderId: payment.order_id
      }
    })

    if (!booking) {
      console.error(`Booking not found for order ${payment.order_id}`)
      return
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'FAILED',
        errorMessage: payment.error_description || 'Payment failed'
      }
    })

    console.log(`Booking ${booking.id} marked as failed via webhook`)

    // Release the lock if payment failed
    if (payment.notes?.lockId) {
      try {
        await releaseLock(payment.notes.lockId)
      } catch (error) {
        console.error('Error releasing lock after payment failure:', error)
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}
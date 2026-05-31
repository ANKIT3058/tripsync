import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyRazorpaySignature, getRazorpayPayment } from '@/lib/razorpay'
import { releaseLock } from '@/lib/locks'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, lockId } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      )
    }

    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    const paymentDetails = await getRazorpayPayment(razorpay_payment_id)

    if (paymentDetails.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
        userId: session.user.id!
      },
      include: {
        hotel: true,
        room: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentId: razorpay_payment_id,
      }
    })

    if (lockId) {
      try {
        await releaseLock(lockId, session.user.id!)
      } catch (error) {
        console.error('Error releasing lock after payment:', error)
      }
    }

    return NextResponse.json({
      message: 'Payment verified and booking confirmed',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        hotel: booking.hotel.name,
        room: booking.room.name,
        checkIn: updatedBooking.checkIn,
        checkOut: updatedBooking.checkOut,
        totalAmount: updatedBooking.totalAmount,
        currency: updatedBooking.currency
      }
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment verification failed' },
      { status: 500 }
    )
  }
}
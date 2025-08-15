import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { refundPayment } from '@/lib/razorpay'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const { amount, reason } = await request.json()

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!booking.paymentId) {
      return NextResponse.json(
        { error: 'No payment found for this booking' },
        { status: 400 }
      )
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking already cancelled' },
        { status: 400 }
      )
    }

    // Process refund through Razorpay
    const refund = await refundPayment(booking.paymentId, amount)

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        errorMessage: reason ? `Refunded by admin: ${reason}` : 'Refunded by admin'
      }
    })

    return NextResponse.json({
      message: 'Refund processed successfully',
      booking: updatedBooking,
      refund: {
        id: refund.id,
        amount: refund.amount / 100, // Convert from paise to currency
        currency: refund.currency,
        status: refund.status
      }
    })
  } catch (error) {
    console.error('Refund booking error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process refund' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateLock } from '@/lib/locks'
import { createRazorpayOrder } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { lockId, amount, currency } = await request.json()

    if (!lockId || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const lock = await validateLock(lockId, session.user.id!)

    if (!lock) {
      return NextResponse.json(
        { error: 'Invalid or expired lock' },
        { status: 400 }
      )
    }

    const receipt = `booking_${uuidv4()}`
    
    const orderData = {
      amount,
      currency: currency.toUpperCase(),
      receipt,
      notes: {
        lockId,
        userId: session.user.id!,
        hotelId: lock.room.hotel.id,
        roomId: lock.roomId,
        checkIn: lock.checkIn.toISOString(),
        checkOut: lock.checkOut.toISOString()
      }
    }

    const razorpayOrder = await createRazorpayOrder(orderData)

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id!,
        hotelId: lock.room.hotel.id,
        roomId: lock.roomId,
        checkIn: lock.checkIn,
        checkOut: lock.checkOut,
        guests: 1, // Default, will be updated based on booking details
        totalAmount: amount,
        currency: currency.toUpperCase(),
        status: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
      }
    })

    return NextResponse.json({
      orderId: razorpayOrder.id,
      bookingId: booking.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Create payment order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
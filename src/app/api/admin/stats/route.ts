import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const [
      totalHotels,
      approvedHotels,
      totalUsers,
      totalBookings,
      bookingStats,
      revenueData
    ] = await Promise.all([
      prisma.hotel.count(),
      prisma.hotel.count({ where: { approved: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.booking.count(),
      prisma.booking.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: {
          totalAmount: true
        }
      })
    ])

    const pendingHotels = totalHotels - approvedHotels

    const bookingsByStatus = bookingStats.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    const stats = {
      totalHotels,
      approvedHotels,
      pendingHotels,
      totalUsers,
      totalBookings,
      pendingBookings: bookingsByStatus.PENDING || 0,
      confirmedBookings: bookingsByStatus.CONFIRMED || 0,
      failedBookings: bookingsByStatus.FAILED || 0,
      totalRevenue: parseFloat(revenueData._sum.totalAmount?.toString() || '0')
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
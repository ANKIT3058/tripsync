'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

interface DashboardStats {
  totalHotels: number
  approvedHotels: number
  pendingHotels: number
  totalUsers: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  failedBookings: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Hotels</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats?.totalHotels || 0}</p>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {stats?.approvedHotels || 0} approved, {stats?.pendingHotels || 0} pending
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Users</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Registered users
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bookings</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats?.totalBookings || 0}</p>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {stats?.confirmedBookings || 0} confirmed, {stats?.pendingBookings || 0} pending
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Revenue</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">${stats?.totalRevenue || 0}</p>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Total confirmed bookings
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/hotels?approved=false"
              className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors"
            >
              <div>
                <h3 className="font-medium text-yellow-800">Pending Hotel Approvals</h3>
                <p className="text-sm text-yellow-600">{stats?.pendingHotels || 0} hotels awaiting approval</p>
              </div>
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/bookings?status=FAILED"
              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <div>
                <h3 className="font-medium text-red-800">Failed Bookings</h3>
                <p className="text-sm text-red-600">{stats?.failedBookings || 0} bookings need attention</p>
              </div>
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/hotels"
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <div>
                <h3 className="font-medium text-blue-800">Manage Hotels</h3>
                <p className="text-sm text-blue-600">Add, edit, and approve hotels</p>
              </div>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                System initialized successfully
              </div>
              <div className="text-xs text-gray-500">
                Just now
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                Admin dashboard activated
              </div>
              <div className="text-xs text-gray-500">
                Just now
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
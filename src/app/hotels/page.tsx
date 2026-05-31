'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, AlertCircle, BedDouble } from 'lucide-react'
import Header from '@/components/layout/Header'
import SearchForm from '@/components/ui/SearchForm'
import HotelCard from '@/components/ui/HotelCard'

interface Hotel {
  id: string
  name: string
  location: string
  city: string
  country: string
  photos: string[]
  amenities: string[]
  available: boolean
  startingPrice: number | null
  currency: string
  rating: number | null
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<HotelsPageSkeleton />}>
      <HotelsPageContent />
    </Suspense>
  )
}

function HotelsPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-48 bg-white/20 rounded-md animate-pulse" />
          <div className="mt-3 h-5 w-72 bg-white/20 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function HotelsPageContent() {
  const searchParams = useSearchParams()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const location = searchParams.get('location') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = parseInt(searchParams.get('guests') || '1')

  const searchHotels = async (filters: {
    location: string
    checkIn: string
    checkOut: string
    guests: number
  }) => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        location: filters.location,
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
        guests: filters.guests.toString()
      })

      const response = await fetch(`/api/hotels/search?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to search hotels')
      }

      const data = await response.json()
      setHotels(data.hotels || [])
    } catch (err) {
      setError('Failed to load hotels. Please try again.')
      console.error('Error searching hotels:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (location && checkIn && checkOut) {
      searchHotels({ location, checkIn, checkOut, guests })
    }
  }, [location, checkIn, checkOut, guests])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero / search band: rich gradient ensures high contrast for the white heading */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.18), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Find Hotels
          </h1>
          <p className="mt-2 text-primary-50/90 max-w-2xl">
            Search thousands of stays. Compare rates instantly, book in seconds.
          </p>
          <div className="mt-8">
            <SearchForm onSearch={searchHotels} />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {location && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Hotels in <span className="text-primary-700">{location}</span>
              </h2>
              {checkIn && checkOut && (
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  {' '}—{' '}
                  {new Date(checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' '}·{' '}
                  {guests} guest{guests !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {!loading && hotels.length > 0 && (
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-800">{hotels.length}</span> result{hotels.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-48 bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && hotels.length === 0 && location && (
          <EmptyState
            title="No hotels found"
            description="We couldn't find stays matching your search. Try different dates, broaden your location, or adjust the guest count."
          />
        )}

        {!loading && !error && !location && (
          <EmptyState
            title="Start your search"
            description="Pick a destination and travel dates above to discover available hotels."
            icon={<Search className="h-7 w-7 text-primary-600" />}
          />
        )}

        {!loading && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                id={hotel.id}
                name={hotel.name}
                location={hotel.location}
                city={hotel.city}
                country={hotel.country}
                photos={hotel.photos}
                amenities={hotel.amenities}
                available={hotel.available}
                startingPrice={hotel.startingPrice}
                currency={hotel.currency}
                rating={hotel.rating}
                searchParams={{
                  checkIn,
                  checkOut,
                  guests
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon?: React.ReactNode
}) {
  return (
    <div className="text-center py-16 px-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="mx-auto h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center">
        {icon ?? <BedDouble className="h-7 w-7 text-primary-600" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">{description}</p>
    </div>
  )
}

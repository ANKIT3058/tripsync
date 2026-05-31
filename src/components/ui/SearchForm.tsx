'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Users, Search, ChevronDown, LoaderCircle } from 'lucide-react'

interface SearchFormProps {
  onSearch?: (filters: {
    location: string
    checkIn: string
    checkOut: string
    guests: number
  }) => void
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!location || !checkIn || !checkOut) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      setErrorMsg('Check-in date cannot be in the past.')
      return
    }

    if (checkOutDate <= checkInDate) {
      setErrorMsg('Check-out date must be after the check-in date.')
      return
    }

    setLoading(true)
    const filters = { location, checkIn, checkOut, guests }

    if (onSearch) {
      onSearch(filters)
      setTimeout(() => setLoading(false), 600)
    } else {
      const params = new URLSearchParams({
        location,
        checkIn,
        checkOut,
        guests: guests.toString(),
      })
      router.push(`/hotels?${params.toString()}`)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const fieldBase =
    'w-full pl-10 pr-3 py-3 text-slate-900 placeholder-slate-400 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-slate-200/70 p-5 md:p-6 text-left">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label htmlFor="location" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or region"
                className={fieldBase}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkIn" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Check-in
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                id="checkIn"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={todayStr}
                className={fieldBase}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkOut" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Check-out
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                id="checkOut"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || tomorrowStr}
                className={fieldBase}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="guests" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Guests
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className={`${fieldBase} appearance-none pr-8`}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Guest{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  )
}

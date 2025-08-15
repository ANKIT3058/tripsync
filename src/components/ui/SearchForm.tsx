'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaSearch } from 'react-icons/fa'
import { IoIosArrowDown } from 'react-icons/io'

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
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!location || !checkIn || !checkOut) {
      alert('Please fill in all required fields')
      return
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      alert('Check-in date cannot be in the past')
      return
    }

    if (checkOutDate <= checkInDate) {
      alert('Check-out date must be after check-in date')
      return
    }

    setLoading(true)
    const filters = { location, checkIn, checkOut, guests }

    if (onSearch) {
      onSearch(filters)
    } else {
      const params = new URLSearchParams({
        location,
        checkIn,
        checkOut,
        guests: guests.toString()
      })
      router.push(`/hotels?${params.toString()}`)
    }
    // Simulate a network request
    setTimeout(() => setLoading(false), 1500)
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 md:p-8 border border-slate-200">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          
          {/* Location Input */}
          <div className="lg:col-span-1 xl:col-span-1">
            <label htmlFor="location" className="block text-xs font-semibold text-slate-500 mb-1">
              Location
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York"
                className="w-full pl-10 pr-3 py-2.5 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                required
              />
            </div>
          </div>

          {/* Check-in Input */}
          <div>
            <label htmlFor="checkIn" className="block text-xs font-semibold text-slate-500 mb-1">
              Check-in
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                id="checkIn"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={todayStr}
                className="w-full pl-10 pr-3 py-2.5 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                required
              />
            </div>
          </div>

          {/* Check-out Input */}
          <div>
            <label htmlFor="checkOut" className="block text-xs font-semibold text-slate-500 mb-1">
              Check-out
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                id="checkOut"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || tomorrowStr}
                className="w-full pl-10 pr-3 py-2.5 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                required
              />
            </div>
          </div>

          {/* Guests Select */}
          <div>
            <label htmlFor="guests" className="block text-xs font-semibold text-slate-500 mb-1">
              Guests
            </label>
            <div className="relative">
              <FaUserFriends className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <IoIosArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full appearance-none pl-10 pr-8 py-2.5 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
              >
                {[...Array(6).keys()].map(i => {
                    const num = i + 1;
                    return (
                      <option key={num} value={num}>
                        {num} Guest{num > 1 ? 's' : ''}
                      </option>
                    )
                })}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="xl:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:bg-cyan-300 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
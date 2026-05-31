import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'

interface HotelCardProps {
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
  searchParams?: {
    checkIn: string
    checkOut: string
    guests: number
  }
}

const currencySymbol = (code: string) => {
  switch ((code || 'USD').toUpperCase()) {
    case 'USD': return '$'
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'INR': return '₹'
    default: return ''
  }
}

export default function HotelCard({
  id,
  name,
  city,
  country,
  photos,
  amenities,
  available,
  startingPrice,
  currency,
  rating,
  searchParams,
}: HotelCardProps) {
  const imageUrl = photos[0] || '/placeholder-hotel.jpg'

  const linkParams = searchParams
    ? new URLSearchParams({
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        guests: searchParams.guests.toString(),
      }).toString()
    : ''

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-hotel.jpg'
          }}
        />
        {rating != null && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            {rating.toFixed(1)}
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-slate-800 shadow">
              Not available
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 leading-snug">
          {name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {city}, {country}
        </p>

        {amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
              >
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-5 flex items-end justify-between gap-3">
          <div>
            {available && startingPrice ? (
              <>
                <p className="text-xs text-slate-500">from</p>
                <p className="text-xl font-bold text-slate-900 leading-none">
                  {currencySymbol(currency)}{startingPrice}
                  <span className="ml-1 text-xs font-normal text-slate-500">/ night</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Price unavailable</p>
            )}
          </div>

          {available ? (
            <Link
              href={`/hotels/${id}${linkParams ? `?${linkParams}` : ''}`}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              View details
            </Link>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-slate-200 text-slate-500 text-sm font-medium rounded-lg cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

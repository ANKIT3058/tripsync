import Link from 'next/link'

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

export default function HotelCard({
  id,
  name,
  location,
  city,
  country,
  photos,
  amenities,
  available,
  startingPrice,
  currency,
  rating,
  searchParams
}: HotelCardProps) {
  const imageUrl = photos[0] || '/placeholder-hotel.jpg'
  
  const linkParams = searchParams ? new URLSearchParams({
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    guests: searchParams.guests.toString()
  }).toString() : ''

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-hotel.jpg'
          }}
        />
        {!available && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
              Not Available
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {name}
          </h3>
          {rating && (
            <div className="flex items-center ml-2">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-2">
          {city}, {country}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {amenity}
            </span>
          ))}
          {amenities.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{amenities.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            {available && startingPrice ? (
              <div className="text-right">
                <span className="text-sm text-gray-500">from</span>
                <div className="text-lg font-bold text-primary-600">
                  ${startingPrice}
                </div>
                <span className="text-xs text-gray-500">per night</span>
              </div>
            ) : (
              <span className="text-gray-500">Price unavailable</span>
            )}
          </div>
          
          {available ? (
            <Link
              href={`/hotels/${id}${linkParams ? `?${linkParams}` : ''}`}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
            >
              View Details
            </Link>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
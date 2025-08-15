import { useState } from 'react'

interface Room {
  id: string
  name: string
  descriptions?: {
    overview: string
  }
  amenities: Array<{
    id: string
    name: string
  }>
  images: Array<{
    links: {
      '70px': {
        href: string
        method: string
      }
    }
  }>
  bed_groups: Array<{
    id: string
    description: string
    type: string
    beds: Array<{
      type: string
      size: string
      quantity: number
    }>
  }>
  area?: {
    square_meters: number
    square_feet: number
  }
  rates: Array<{
    id: string
    status: string
    available_rooms: number
    refundable: boolean
    occupancy_pricing: Array<{
      totals: {
        inclusive: {
          request_currency: {
            value: string
            currency: string
          }
        }
      }
    }>
    cancel_penalty?: {
      start_datetime: string
      end_datetime: string
      nights: number
      currency: string
      amount: string
    }
  }>
}

interface RoomCardProps {
  room: Room
  onBookRoom: (roomId: string, rateId: string, price: number, currency: string) => void
  loading?: boolean
}

export default function RoomCard({ room, onBookRoom, loading = false }: RoomCardProps) {
  const [selectedRate, setSelectedRate] = useState(room.rates[0]?.id || '')
  
  const getLowestPrice = () => {
    if (!room.rates || room.rates.length === 0) return null
    
    const prices = room.rates.map(rate => {
      const pricing = rate.occupancy_pricing[0]?.totals?.inclusive?.request_currency
      return pricing ? parseFloat(pricing.value) : Infinity
    })
    
    const minPrice = Math.min(...prices)
    return minPrice === Infinity ? null : minPrice
  }

  const getSelectedRateDetails = () => {
    const rate = room.rates.find(r => r.id === selectedRate) || room.rates[0]
    if (!rate) return null

    const pricing = rate.occupancy_pricing[0]?.totals?.inclusive?.request_currency
    return {
      rate,
      price: pricing ? parseFloat(pricing.value) : 0,
      currency: pricing?.currency || 'USD'
    }
  }

  const handleBookNow = () => {
    const rateDetails = getSelectedRateDetails()
    if (rateDetails) {
      onBookRoom(room.id, rateDetails.rate.id, rateDetails.price, rateDetails.currency)
    }
  }

  const lowestPrice = getLowestPrice()
  const rateDetails = getSelectedRateDetails()
  const mainImage = room.images?.[0]?.links?.['70px']?.href || '/placeholder-room.jpg'

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img
            src={mainImage}
            alt={room.name}
            className="w-full h-48 md:h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-room.jpg'
            }}
          />
        </div>
        
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
            {lowestPrice && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  ${lowestPrice}
                </div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
            )}
          </div>

          {room.descriptions?.overview && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {room.descriptions.overview}
            </p>
          )}

          {room.bed_groups && room.bed_groups.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Bed Configuration</h4>
              <div className="flex flex-wrap gap-2">
                {room.bed_groups.map((bedGroup, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {bedGroup.description}
                  </span>
                ))}
              </div>
            </div>
          )}

          {room.area && (
            <div className="mb-4">
              <span className="text-gray-600 text-sm">
                Area: {room.area.square_feet} sq ft ({room.area.square_meters} sq m)
              </span>
            </div>
          )}

          {room.amenities && room.amenities.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-1">
                {room.amenities.slice(0, 4).map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                  >
                    {amenity.name}
                  </span>
                ))}
                {room.amenities.length > 4 && (
                  <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                    +{room.amenities.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {room.rates && room.rates.length > 1 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Rate Options</h4>
              <select
                value={selectedRate}
                onChange={(e) => setSelectedRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {room.rates.map((rate) => {
                  const pricing = rate.occupancy_pricing[0]?.totals?.inclusive?.request_currency
                  const price = pricing ? parseFloat(pricing.value) : 0
                  return (
                    <option key={rate.id} value={rate.id}>
                      ${price} - {rate.refundable ? 'Refundable' : 'Non-refundable'}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {rateDetails?.rate.cancel_penalty && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-sm text-yellow-800">
                <strong>Cancellation Policy:</strong> ${rateDetails.rate.cancel_penalty.amount} penalty 
                if cancelled after {new Date(rateDetails.rate.cancel_penalty.start_datetime).toLocaleDateString()}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {rateDetails?.rate.available_rooms} room{rateDetails?.rate.available_rooms !== 1 ? 's' : ''} left
            </div>
            <button
              onClick={handleBookNow}
              disabled={loading || !rateDetails}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
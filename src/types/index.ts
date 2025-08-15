export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  suspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotel {
  id: string;
  externalId: string;
  name: string;
  description: string;
  location: string;
  city: string;
  country: string;
  address: string;
  latitude?: number;
  longitude?: number;
  photos: string[];
  amenities: string[];
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  hotelId: string;
  externalRoomId: string;
  name: string;
  description: string;
  capacity: number;
  amenities: string[];
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED';
  paymentId?: string;
  razorpayOrderId?: string;
  externalBookingId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lock {
  id: string;
  roomId: string;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface EPSHotel {
  property_id: string;
  name: string;
  address: {
    line_1: string;
    line_2?: string;
    city: string;
    state_province_code: string;
    country_code: string;
    postal_code: string;
  };
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  ratings: {
    property: {
      rating: number;
      type: string;
    };
    guest: {
      count: number;
      overall: number;
    };
  };
  amenities: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    links: {
      70px: {
        href: string;
        method: string;
      };
    };
  }>;
  onsite_payments: {
    currency: string;
    types: {
      merchant_of_record: string;
    };
  };
}

export interface EPSAvailability {
  property_id: string;
  rooms: Array<{
    id: string;
    name: string;
    descriptions: {
      overview: string;
    };
    amenities: Array<{
      id: string;
      name: string;
    }>;
    images: Array<{
      links: {
        70px: {
          href: string;
          method: string;
        };
      };
    }>;
    bed_groups: Array<{
      id: string;
      description: string;
      type: string;
      beds: Array<{
        type: string;
        size: string;
        quantity: number;
      }>;
    }>;
    area: {
      square_meters: number;
      square_feet: number;
    };
    rates: Array<{
      id: string;
      status: string;
      available_rooms: number;
      refundable: boolean;
      member_deal_available: boolean;
      sale: boolean;
      merchant_of_record: string;
      amenities: Array<{
        id: string;
        name: string;
      }>;
      links: {
        payment_options: {
          href: string;
          method: string;
        };
      };
      bed_group_id: string;
      cancel_penalty: {
        start_datetime: string;
        end_datetime: string;
        nights: number;
        currency: string;
        amount: string;
      };
      occupancy_pricing: Array<{
        nightly: Array<Array<{
          type: string;
          value: string;
          currency: string;
        }>>;
        totals: {
          marketing_fee: {
            request_currency: {
              value: string;
              currency: string;
            };
          };
          inclusive: {
            request_currency: {
              value: string;
              currency: string;
            };
          };
          exclusive: {
            request_currency: {
              value: string;
              currency: string;
            };
          };
          gross_profit: {
            request_currency: {
              value: string;
              currency: string;
            };
          };
          property_inclusive: {
            request_currency: {
              value: string;
              currency: string;
            };
          };
        };
      }>;
    }>;
  }>;
}

export interface SearchFilters {
  location: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
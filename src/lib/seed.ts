import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    await prisma.user.upsert({
      where: { email: 'admin@tripsync.com' },
      update: {},
      create: {
        email: 'admin@tripsync.com',
        passwordHash: adminPassword,
        name: 'TripSync Admin',
        role: 'ADMIN'
      }
    })

    // Create test user
    const userPassword = await bcrypt.hash('user123', 12)
    await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        passwordHash: userPassword,
        name: 'Test User',
        role: 'USER'
      }
    })

    // Create sample hotels
    const hotels = [
      {
        externalId: 'hotel_123456',
        name: 'Grand Plaza Hotel',
        description: 'A luxurious 5-star hotel in the heart of the city with world-class amenities and service.',
        location: 'Downtown District',
        city: 'New York',
        country: 'United States',
        address: '123 Broadway, New York, NY 10001',
        latitude: 40.7505,
        longitude: -73.9934,
        photos: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
        ],
        amenities: ['Free WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Room Service'],
        approved: true
      },
      {
        externalId: 'hotel_789012',
        name: 'Seaside Resort',
        description: 'Beautiful beachfront resort with stunning ocean views and private beach access.',
        location: 'Beachfront',
        city: 'Miami',
        country: 'United States',
        address: '456 Ocean Drive, Miami, FL 33139',
        latitude: 25.7907,
        longitude: -80.1300,
        photos: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        amenities: ['Beach Access', 'Pool', 'Bar', 'Water Sports', 'Spa'],
        approved: true
      },
      {
        externalId: 'hotel_345678',
        name: 'Mountain Lodge',
        description: 'Cozy mountain retreat perfect for nature lovers and adventure seekers.',
        location: 'Mountain View',
        city: 'Denver',
        country: 'United States',
        address: '789 Mountain Road, Denver, CO 80202',
        latitude: 39.7391,
        longitude: -104.9847,
        photos: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
        ],
        amenities: ['Hiking Trails', 'Fireplace', 'Restaurant', 'Free WiFi'],
        approved: false // This one is pending approval
      }
    ]

    for (const hotelData of hotels) {
      const hotel = await prisma.hotel.upsert({
        where: { externalId: hotelData.externalId },
        update: {},
        create: hotelData
      })

      // Create sample rooms for each hotel
      const rooms = [
        {
          externalRoomId: `${hotelData.externalId}_room_1`,
          name: 'Standard Double Room',
          description: 'Comfortable room with city view',
          capacity: 2,
          amenities: ['Air Conditioning', 'Free WiFi', 'TV'],
          photos: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800']
        },
        {
          externalRoomId: `${hotelData.externalId}_room_2`,
          name: 'Deluxe Suite',
          description: 'Spacious suite with premium amenities',
          capacity: 4,
          amenities: ['Air Conditioning', 'Free WiFi', 'TV', 'Mini Bar', 'Balcony'],
          photos: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800']
        }
      ]

      for (const roomData of rooms) {
        await prisma.room.upsert({
          where: {
            hotelId_externalRoomId: {
              hotelId: hotel.id,
              externalRoomId: roomData.externalRoomId
            }
          },
          update: {},
          create: {
            ...roomData,
            hotelId: hotel.id
          }
        })
      }
    }

    console.log('✅ Database seeded successfully!')
    console.log('🔑 Admin login: admin@tripsync.com / admin123')
    console.log('👤 User login: user@example.com / user123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}
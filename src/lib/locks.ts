import { prisma } from './prisma'

const LOCK_DURATION_MINUTES = 10

export async function createRoomLock(params: {
  roomId: string
  userId: string
  checkIn: Date
  checkOut: Date
}) {
  const { roomId, userId, checkIn, checkOut } = params
  
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + LOCK_DURATION_MINUTES)

  try {
    await cleanExpiredLocks()

    const existingLock = await prisma.lock.findFirst({
      where: {
        roomId,
        checkIn,
        checkOut,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingLock && existingLock.userId !== userId) {
      throw new Error('Room is currently being booked by another user. Please try again later.')
    }

    if (existingLock && existingLock.userId === userId) {
      return await prisma.lock.update({
        where: { id: existingLock.id },
        data: { expiresAt }
      })
    }

    const lock = await prisma.lock.create({
      data: {
        roomId,
        userId,
        checkIn,
        checkOut,
        expiresAt
      }
    })

    return lock
  } catch (error) {
    console.error('Error creating room lock:', error)
    throw error
  }
}

export async function validateLock(lockId: string, userId: string) {
  try {
    await cleanExpiredLocks()

    const lock = await prisma.lock.findUnique({
      where: { id: lockId },
      include: {
        room: {
          include: {
            hotel: true
          }
        }
      }
    })

    if (!lock) {
      throw new Error('Lock not found or has expired')
    }

    if (lock.userId !== userId) {
      throw new Error('Unauthorized access to lock')
    }

    if (lock.expiresAt <= new Date()) {
      await prisma.lock.delete({ where: { id: lockId } })
      throw new Error('Lock has expired')
    }

    return lock
  } catch (error) {
    console.error('Error validating lock:', error)
    throw error
  }
}

export async function extendLock(lockId: string, userId: string) {
  try {
    const lock = await validateLock(lockId, userId)
    
    const newExpiresAt = new Date()
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + LOCK_DURATION_MINUTES)

    return await prisma.lock.update({
      where: { id: lockId },
      data: { expiresAt: newExpiresAt }
    })
  } catch (error) {
    console.error('Error extending lock:', error)
    throw error
  }
}

export async function releaseLock(lockId: string, userId?: string) {
  try {
    const lock = await prisma.lock.findUnique({
      where: { id: lockId }
    })

    if (lock && userId && lock.userId !== userId) {
      throw new Error('Unauthorized to release this lock')
    }

    if (lock) {
      await prisma.lock.delete({ where: { id: lockId } })
    }

    return true
  } catch (error) {
    console.error('Error releasing lock:', error)
    throw error
  }
}

export async function cleanExpiredLocks() {
  try {
    const result = await prisma.lock.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    if (result.count > 0) {
      console.log(`Cleaned up ${result.count} expired locks`)
    }

    return result.count
  } catch (error) {
    console.error('Error cleaning expired locks:', error)
    return 0
  }
}

export async function checkRoomAvailability(params: {
  roomId: string
  checkIn: Date
  checkOut: Date
  excludeUserId?: string
}) {
  const { roomId, checkIn, checkOut, excludeUserId } = params
  
  await cleanExpiredLocks()

  const activeLocks = await prisma.lock.findMany({
    where: {
      roomId,
      checkIn,
      checkOut,
      expiresAt: {
        gt: new Date()
      },
      ...(excludeUserId && {
        userId: {
          not: excludeUserId
        }
      })
    }
  })

  const activeBookings = await prisma.booking.count({
    where: {
      roomId,
      status: {
        in: ['PENDING', 'CONFIRMED']
      },
      OR: [
        {
          AND: [
            { checkIn: { lte: checkIn } },
            { checkOut: { gt: checkIn } }
          ]
        },
        {
          AND: [
            { checkIn: { lt: checkOut } },
            { checkOut: { gte: checkOut } }
          ]
        },
        {
          AND: [
            { checkIn: { gte: checkIn } },
            { checkOut: { lte: checkOut } }
          ]
        }
      ]
    }
  })

  return {
    available: activeLocks.length === 0 && activeBookings === 0,
    activeLocks: activeLocks.length,
    activeBookings
  }
}
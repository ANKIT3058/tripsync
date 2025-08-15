import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { extendLock } from '@/lib/locks'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const lock = await extendLock(params.id, (session.user as any).id)

    return NextResponse.json({
      message: 'Lock extended successfully',
      expiresAt: lock.expiresAt
    })
  } catch (error) {
    console.error('Extend lock error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extend lock' },
      { status: 400 }
    )
  }
}
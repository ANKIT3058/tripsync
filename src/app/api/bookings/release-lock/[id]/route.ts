import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { releaseLock } from '@/lib/locks'

export async function DELETE(
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

    await releaseLock(params.id, (session.user as any).id)

    return NextResponse.json({
      message: 'Lock released successfully'
    })
  } catch (error) {
    console.error('Release lock error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to release lock' },
      { status: 400 }
    )
  }
}
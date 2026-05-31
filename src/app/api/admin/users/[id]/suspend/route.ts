import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) {
    return session
  }

  try {
    const { id } = await params
    // Prevent admin from suspending themselves
    if (id === session.user.id!) {
      return NextResponse.json(
        { error: 'Cannot suspend your own account' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot suspend admin users' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { suspended: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        suspended: true
      }
    })

    return NextResponse.json({
      message: 'User suspended successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Suspend user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) {
    return session
  }

  try {
    const { id } = await params
    // Prevent admin from unsuspending themselves (they shouldn't be suspended anyway)
    if (id === session.user.id!) {
      return NextResponse.json(
        { error: 'Cannot modify your own account' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { suspended: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        suspended: true
      }
    })

    return NextResponse.json({
      message: 'User suspension lifted successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Unsuspend user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
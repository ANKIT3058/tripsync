import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  return NextResponse.json({
    baseUrl: process.env.EPS_RAPID_BASE_URL || 'https://test.ean.com/v3',
    hasApiKey: !!process.env.EPS_RAPID_API_KEY,
    nodeEnv: process.env.NODE_ENV
  })
}
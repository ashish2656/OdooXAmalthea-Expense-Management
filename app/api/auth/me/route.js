import { NextResponse } from 'next/server'
import { authMiddleware, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/auth/me - Get current user information
export async function GET(request) {
  try {
    const authResult = await authMiddleware(request)
    
    // If authMiddleware returned an error, return it
    if (authResult.error) {
      return authResult.error
    }

    const user = authResult.user

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        managerId: user.managerId,
        company: user.company,
        manager: user.manager
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
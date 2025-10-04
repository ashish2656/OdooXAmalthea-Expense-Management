import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function authMiddleware(request) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }

  // Get user details from database
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        company: true,
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!user) {
      return {
        error: NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        )
      }
    }

    // Return user data for API routes to use
    return {
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
    }

  } catch (error) {
    console.error('Auth middleware error:', error)
    return {
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

export function requireRole(user, ...allowedRoles) {
  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return null // Continue to route handler
}

// Helper to get user from auth middleware result
export function getUserFromRequest(authResult) {
  return authResult.user
}
import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/users/[id] - Get specific user
export async function GET(request, { params }) {
  const { id } = params

  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const adminUser = authResult.user

    const roleCheck = requireRole(adminUser, 'ADMIN')
    if (roleCheck instanceof NextResponse) return roleCheck

    const user = await prisma.user.findUnique({
      where: { 
        id,
        companyId: adminUser.companyId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        managerId: true,
        manager: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          expenses: true,
          approvals: true,
          managees: true
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user (role, status)
export async function PUT(request, { params }) {
  const { id } = params
  
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const adminUser = authResult.user

    const roleCheck = requireRole(adminUser, 'ADMIN')
    if (roleCheck instanceof NextResponse) return roleCheck

    const { role, isActive } = await request.json()

    // Verify user exists and is in same company
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: adminUser.companyId
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deactivating themselves
    if (existingUser.id === adminUser.id && isActive === false) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    // Validate role if provided
    if (role && !['EMPLOYEE', 'MANAGER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const updateData = {}
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user (soft delete by deactivating)
export async function DELETE(request, { params }) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const roleCheck = requireRole('ADMIN')(request)
  if (roleCheck instanceof NextResponse) return roleCheck

  const adminUser = getUserFromRequest(request)
  const { id: userId } = params

  try {
    // Verify user exists and is in same company
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: adminUser.companyId
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting themselves
    if (existingUser.id === adminUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user has pending expenses
    const pendingExpenses = await prisma.expense.count({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    })

    if (pendingExpenses > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with pending or approved expenses' },
        { status: 400 }
      )
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
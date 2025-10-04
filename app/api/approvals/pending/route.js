import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/approvals/pending - Get pending approvals for manager/admin
export async function GET(request) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user
    
    const roleCheck = requireRole(user, 'MANAGER', 'ADMIN')
    if (roleCheck instanceof NextResponse) return roleCheck
    let whereClause = {
      status: 'PENDING'
    }

    if (user.role === 'MANAGER') {
      // Managers only see approvals assigned to them
      whereClause.approverId = user.id
    } else if (user.role === 'ADMIN') {
      // Admins can see all pending approvals in their company
      const companyUsers = await prisma.user.findMany({
        where: { companyId: user.companyId },
        select: { id: true }
      })
      const companyUserIds = companyUsers.map(u => u.id)
      whereClause.approverId = { in: companyUserIds }
    }

    const pendingApprovals = await prisma.approval.findMany({
      where: whereClause,
      include: {
        expense: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        approver: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: [
        { stepOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({ approvals: pendingApprovals })

  } catch (error) {
    console.error('Get pending approvals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
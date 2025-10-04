import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/approvals/approved - Get approved approvals for manager/admin
export async function GET(request) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user
    
    const roleCheck = requireRole(user, 'MANAGER', 'ADMIN')
    if (roleCheck instanceof NextResponse) return roleCheck

    let whereClause = {
      status: 'APPROVED'
    }

    if (user.role === 'MANAGER') {
      // Managers only see approvals assigned to them
      whereClause.approverId = user.id
    } else if (user.role === 'ADMIN') {
      // Admins can see all approved approvals in their company
      const companyUsers = await prisma.user.findMany({
        where: { companyId: user.companyId },
        select: { id: true }
      })
      const companyUserIds = companyUsers.map(u => u.id)
      whereClause.approverId = { in: companyUserIds }
    }

    const approvedApprovals = await prisma.approval.findMany({
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
        { updatedAt: 'desc' }
      ]
    })

    return NextResponse.json({ approvals: approvedApprovals })

  } catch (error) {
    console.error('Get approved approvals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
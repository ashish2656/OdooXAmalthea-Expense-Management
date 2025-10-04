import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/approvals/stats - Get approval statistics for manager/admin
export async function GET(request) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user
    
    const roleCheck = requireRole(user, 'MANAGER', 'ADMIN')
    if (roleCheck instanceof NextResponse) return roleCheck

    let whereClause = {}

    if (user.role === 'MANAGER') {
      // Managers only see approvals assigned to them
      whereClause.approverId = user.id
    } else if (user.role === 'ADMIN') {
      // Admins can see all approvals in their company
      const companyUsers = await prisma.user.findMany({
        where: { companyId: user.companyId },
        select: { id: true }
      })
      const companyUserIds = companyUsers.map(u => u.id)
      whereClause.approverId = { in: companyUserIds }
    }

    // Get all approvals for stats
    const allApprovals = await prisma.approval.findMany({
      where: whereClause,
      include: {
        expense: {
          select: {
            createdAt: true,
            amount: true
          }
        }
      }
    })

    // Calculate statistics
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const stats = {
      totalPending: allApprovals.filter(a => a.status === 'PENDING').length,
      totalApproved: allApprovals.filter(a => a.status === 'APPROVED').length,
      totalRejected: allApprovals.filter(a => a.status === 'REJECTED').length,
      thisMonth: allApprovals.filter(a => {
        const approvalDate = new Date(a.expense.createdAt)
        return approvalDate.getMonth() === currentMonth && 
               approvalDate.getFullYear() === currentYear
      }).length,
      totalAmount: allApprovals
        .filter(a => a.status === 'APPROVED')
        .reduce((sum, a) => sum + parseFloat(a.expense.amount || 0), 0)
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Get approval stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
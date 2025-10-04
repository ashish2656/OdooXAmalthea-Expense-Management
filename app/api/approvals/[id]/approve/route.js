import { NextResponse } from 'next/server'
import { authMiddleware, requireRole } from '@/lib/middleware'
import { processApproval } from '@/lib/expense-utils'
import { prisma } from '@/lib/prisma'

// POST /api/approvals/[id]/approve - Approve expense
export async function POST(request, { params }) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user

    const roleCheck = requireRole(user, 'MANAGER', 'ADMIN')
    if (roleCheck instanceof NextResponse) return roleCheck

    const { id: approvalId } = params
    const { comments } = await request.json()

    // Verify approval exists and user can approve it
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        expense: {
          include: {
            user: {
              select: { id: true, name: true, email: true, companyId: true },
            },
          },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    if (approval.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Approval already processed' },
        { status: 400 }
      )
    }

    // Check if user can approve this (either assigned approver or admin of same company)
    if (user.role === 'ADMIN') {
      // Admin can approve any expense in their company
      if (approval.expense.user.companyId !== user.companyId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else {
      // Manager can only approve if assigned as approver
      if (approval.approverId !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const updatedApproval = await processApproval(
      approvalId,
      'APPROVED',
      comments,
      user.id
    )

    return NextResponse.json({
      success: true,
      message: 'Expense approved successfully',
      approval: updatedApproval,
    })
  } catch (error) {
    console.error('Approve expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
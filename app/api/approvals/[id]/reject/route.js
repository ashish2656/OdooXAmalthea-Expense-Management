import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { processApproval } from '@/lib/expense-utils'
import { prisma } from '@/lib/prisma'

// POST /api/approvals/[id]/reject - Reject expense
export async function POST(request, { params }) {
  const { id: approvalId } = params
  
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user

    const roleCheck = requireRole(user, 'MANAGER', 'ADMIN')
    if (roleCheck instanceof NextResponse) return roleCheck
    const { comments } = await request.json()

    if (!comments || comments.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comments are required when rejecting an expense' },
        { status: 400 }
      )
    }

    // Verify approval exists and user can reject it
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        expense: {
          include: {
            user: {
              select: { id: true, name: true, email: true, companyId: true }
            }
          }
        }
      }
    })

    if (!approval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      )
    }

    if (approval.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Approval already processed' },
        { status: 400 }
      )
    }

    // Check if user can reject this
    if (user.role === 'ADMIN') {
      // Admin can reject any expense in their company
      if (approval.expense.user.companyId !== user.companyId) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    } else {
      // Manager can only reject if assigned as approver
      if (approval.approverId !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    const updatedApproval = await processApproval(
      approvalId,
      'REJECTED',
      comments,
      user.id
    )

    return NextResponse.json({
      success: true,
      message: 'Expense rejected successfully',
      approval: updatedApproval
    })

  } catch (error) {
    console.error('Reject expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
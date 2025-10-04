import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/approval-rules/[id] - Update approval rule
export async function PUT(request, { params }) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const roleCheck = requireRole('ADMIN')(request)
  if (roleCheck instanceof NextResponse) return roleCheck

  const user = getUserFromRequest(request)
  const { id: ruleId } = params

  try {
    const { threshold, approverId } = await request.json()

    if (!threshold || !approverId) {
      return NextResponse.json(
        { error: 'Threshold and approver ID are required' },
        { status: 400 }
      )
    }

    if (threshold <= 0) {
      return NextResponse.json(
        { error: 'Threshold must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify rule exists and belongs to company
    const existingRule = await prisma.approvalRule.findFirst({
      where: {
        id: ruleId,
        companyId: user.companyId
      }
    })

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Approval rule not found' },
        { status: 404 }
      )
    }

    // Verify approver exists and is in same company
    const approver = await prisma.user.findFirst({
      where: {
        id: approverId,
        companyId: user.companyId,
        role: { in: ['MANAGER', 'ADMIN'] }
      }
    })

    if (!approver) {
      return NextResponse.json(
        { error: 'Invalid approver ID' },
        { status: 400 }
      )
    }

    // Check for duplicate threshold (excluding current rule)
    const duplicateRule = await prisma.approvalRule.findFirst({
      where: {
        companyId: user.companyId,
        threshold,
        NOT: { id: ruleId }
      }
    })

    if (duplicateRule) {
      return NextResponse.json(
        { error: 'Approval rule with this threshold already exists' },
        { status: 400 }
      )
    }

    const updatedRule = await prisma.approvalRule.update({
      where: { id: ruleId },
      data: {
        threshold,
        approverId
      },
      include: {
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Approval rule updated successfully',
      approvalRule: updatedRule
    })

  } catch (error) {
    console.error('Update approval rule error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/approval-rules/[id] - Delete approval rule
export async function DELETE(request, { params }) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const roleCheck = requireRole('ADMIN')(request)
  if (roleCheck instanceof NextResponse) return roleCheck

  const user = getUserFromRequest(request)
  const { id: ruleId } = params

  try {
    // Verify rule exists and belongs to company
    const existingRule = await prisma.approvalRule.findFirst({
      where: {
        id: ruleId,
        companyId: user.companyId
      }
    })

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Approval rule not found' },
        { status: 404 }
      )
    }

    // Check if rule has any pending approvals
    const pendingApprovals = await prisma.approval.count({
      where: {
        expense: {
          amount: { gte: existingRule.threshold }
        },
        status: 'PENDING'
      }
    })

    if (pendingApprovals > 0) {
      return NextResponse.json(
        { error: 'Cannot delete rule with pending approvals' },
        { status: 400 }
      )
    }

    await prisma.approvalRule.delete({
      where: { id: ruleId }
    })

    return NextResponse.json({
      success: true,
      message: 'Approval rule deleted successfully'
    })

  } catch (error) {
    console.error('Delete approval rule error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
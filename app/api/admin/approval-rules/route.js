import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/approval-rules - Get all approval rules
export async function GET(request) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const user = getUserFromRequest(authResult)
  const roleCheck = requireRole(user, 'ADMIN')
  if (roleCheck instanceof NextResponse) return roleCheck

  try {
    const approvalRules = await prisma.approvalRule.findMany({
      where: { companyId: user.companyId },
      include: {
        specialApprover: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { threshold: 'asc' }
    })

    return NextResponse.json({
      success: true,
      approvalRules
    })

  } catch (error) {
    console.error('Get approval rules error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/approval-rules - Create new approval rule
export async function POST(request) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const user = getUserFromRequest(authResult)
  const roleCheck = requireRole(user, 'ADMIN')
  if (roleCheck instanceof NextResponse) return roleCheck

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

    // Check for duplicate threshold
    const existingRule = await prisma.approvalRule.findFirst({
      where: {
        companyId: user.companyId,
        threshold
      }
    })

    if (existingRule) {
      return NextResponse.json(
        { error: 'Approval rule with this threshold already exists' },
        { status: 400 }
      )
    }

    const approvalRule = await prisma.approvalRule.create({
      data: {
        threshold,
        specialApproverId: approverId,
        companyId: user.companyId,
        ruleType: 'SPECIFIC_APPROVER'
      },
      include: {
        specialApprover: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Approval rule created successfully',
      approvalRule
    }, { status: 201 })

  } catch (error) {
    console.error('Create approval rule error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
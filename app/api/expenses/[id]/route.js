import { NextResponse } from 'next/server'
import { authMiddleware, getUserFromRequest } from '@/lib/middleware'
import { canAccessExpense } from '@/lib/expense-utils'
import { prisma } from '@/lib/prisma'

// GET /api/expenses/[id] - Get specific expense
export async function GET(request, { params }) {
  const { id } = params
  
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user
    // Check if user can access this expense
    const hasAccess = await canAccessExpense(user.id, user.role, id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: { stepOrder: 'asc' }
        }
      }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ expense })

  } catch (error) {
    console.error('Get expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/expenses/[id] - Update expense (only if pending and owner)
export async function PUT(request, { params }) {
  const { id } = params
  
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user
    // Check if user owns this expense
    const expense = await prisma.expense.findUnique({
      where: { id },
      select: { userId: true, status: true }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    if (expense.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (expense.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot update non-pending expenses' },
        { status: 400 }
      )
    }

    const { amount, currency, category, vendor, description, date, receiptUrl } = await request.json()

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        currency: currency || undefined,
        category: category || undefined,
        vendor: vendor !== undefined ? vendor : undefined,
        description: description !== undefined ? description : undefined,
        date: date ? new Date(date) : undefined,
        receiptUrl: receiptUrl !== undefined ? receiptUrl : undefined,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      expense: updatedExpense
    })

  } catch (error) {
    console.error('Update expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/expenses/[id] - Delete expense (only if pending and owner or admin)
export async function DELETE(request, { params }) {
  const { id } = params
  
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user
    const expense = await prisma.expense.findUnique({
      where: { id },
      select: { userId: true, status: true }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    if (expense.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (expense.status !== 'PENDING' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete non-pending expenses' },
        { status: 400 }
      )
    }

    await prisma.expense.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    })

  } catch (error) {
    console.error('Delete expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
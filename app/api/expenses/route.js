import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { convertToCompanyCurrency } from '@/lib/exchange-rates'
import { getApprovalWorkflow, createApprovalEntries } from '@/lib/expense-utils'

// GET /api/expenses - Get user's expenses or team expenses
export async function GET(request) {
  const authResult = await authMiddleware(request)
  if (authResult.error) return authResult.error

  const user = authResult.user
  const { searchParams } = new URL(request.url)
  
  // Query parameters for filtering
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const fromDate = searchParams.get('fromDate')
  const toDate = searchParams.get('toDate')
  const userId = searchParams.get('userId') // For admin/manager to filter by specific user

  try {
    let whereClause = {}

    // Role-based access control
    if (user.role === 'EMPLOYEE') {
      whereClause.userId = user.id
    } else if (user.role === 'MANAGER') {
      // Get team members + self
      const teamMembers = await prisma.user.findMany({
        where: { managerId: user.id },
        select: { id: true }
      })
      const teamMemberIds = teamMembers.map(member => member.id)
      teamMemberIds.push(user.id) // Include manager's own expenses
      
      whereClause.userId = { in: teamMemberIds }
    } else if (user.role === 'ADMIN') {
      // Admin can see all company expenses
      const companyUsers = await prisma.user.findMany({
        where: { companyId: user.companyId },
        select: { id: true }
      })
      const companyUserIds = companyUsers.map(u => u.id)
      whereClause.userId = { in: companyUserIds }
    }

    // Apply filters
    if (status) whereClause.status = status
    if (category) whereClause.category = category
    if (userId && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      whereClause.userId = userId
    }
    if (fromDate) {
      whereClause.date = { gte: new Date(fromDate) }
    }
    if (toDate) {
      whereClause.date = whereClause.date 
        ? { ...whereClause.date, lte: new Date(toDate) }
        : { lte: new Date(toDate) }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { stepOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ expenses })

  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/expenses - Create new expense (Employee only)
export async function POST(request) {
  const authResult = await authMiddleware(request)
  if (authResult.error) return authResult.error

  const user = authResult.user
  
  const roleCheck = requireRole(user, 'EMPLOYEE', 'MANAGER', 'ADMIN')
  if (roleCheck instanceof NextResponse) return roleCheck

  try {
    const { amount, currency, category, vendor, description, date, receiptUrl } = await request.json()

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Get company currency for conversion
    const company = await prisma.company.findUnique({
      where: { id: user.companyId }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Convert amount to company currency
    const convertedAmount = await convertToCompanyCurrency(
      amount, 
      currency || company.currency, 
      company.currency
    )

    // Create expense
    const expense = await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: {
          userId: user.id,
          amount: parseFloat(amount),
          currency: currency || company.currency,
          convertedAmount,
          category,
          vendor,
          description,
          date: date ? new Date(date) : new Date(),
          receiptUrl,
          status: 'PENDING'
        }
      })

      // Get approval workflow
      const workflow = await getApprovalWorkflow(
        newExpense.id, 
        user.companyId, 
        convertedAmount
      )

      if (workflow.length === 0) {
        // Auto-approve if no workflow required
        await tx.expense.update({
          where: { id: newExpense.id },
          data: { status: 'APPROVED' }
        })
      } else {
        // Create approval entries
        await createApprovalEntries(newExpense.id, workflow)
      }

      return newExpense
    })

    return NextResponse.json({
      success: true,
      message: 'Expense created successfully',
      expense: {
        id: expense.id,
        amount: expense.amount,
        convertedAmount: expense.convertedAmount,
        currency: expense.currency,
        category: expense.category,
        status: expense.status,
        date: expense.date
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
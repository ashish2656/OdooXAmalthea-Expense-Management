import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/dashboard - Get admin dashboard statistics
export async function GET(request) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult.error) return authResult.error

    const user = authResult.user
    console.log('Dashboard API - User:', user.id, user.email, user.companyId)

    const roleCheck = requireRole(user, 'ADMIN')
    if (roleCheck instanceof NextResponse) return roleCheck
    // Get date ranges for comparisons
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [
      totalUsers,
      totalExpenses,
      pendingApprovals,
      approvedExpensesThisMonth,
      approvedExpensesLastMonth,
      totalExpenseAmount,
      expensesByCategory,
      recentExpenses,
      approvalRules
    ] = await Promise.all([
      // Total users in company
      prisma.user.count({
        where: { companyId: user.companyId }
      }),

      // Total expenses
      prisma.expense.count({
        where: {
          user: { companyId: user.companyId }
        }
      }),

      // Pending approvals
      prisma.approval.count({
        where: {
          status: 'PENDING',
          expense: {
            user: { companyId: user.companyId }
          }
        }
      }),

      // Approved expenses this month
      prisma.expense.count({
        where: {
          user: { companyId: user.companyId },
          status: 'APPROVED',
          updatedAt: { gte: startOfMonth }
        }
      }),

      // Approved expenses last month
      prisma.expense.count({
        where: {
          user: { companyId: user.companyId },
          status: 'APPROVED',
          updatedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Total expense amount (approved)
      prisma.expense.aggregate({
        where: {
          user: { companyId: user.companyId },
          status: 'APPROVED'
        },
        _sum: { amount: true }
      }),

      // Expenses by category (top 5)
      prisma.expense.groupBy({
        by: ['category'],
        where: {
          user: { companyId: user.companyId },
          status: 'APPROVED'
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      }),

      // Recent expenses
      prisma.expense.findMany({
        where: {
          user: { companyId: user.companyId }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Approval rules count
      prisma.approvalRule.count({
        where: { companyId: user.companyId }
      })
    ])

    console.log('Dashboard API - Counts:', {
      totalUsers,
      totalExpenses,
      pendingApprovals,
      approvedExpensesThisMonth,
      totalExpenseAmount: totalExpenseAmount._sum.amount
    })

    // Calculate month-over-month growth
    const expenseGrowth = approvedExpensesLastMonth > 0 
      ? ((approvedExpensesThisMonth - approvedExpensesLastMonth) / approvedExpensesLastMonth) * 100
      : 0

    const stats = {
      overview: {
        totalUsers,
        totalExpenses,
        pendingApprovals,
        approvedExpensesThisMonth,
        totalExpenseAmount: totalExpenseAmount._sum.amount || 0,
        expenseGrowth: Math.round(expenseGrowth * 100) / 100,
        approvalRules
      },
      expensesByCategory: expensesByCategory.map(item => ({
        category: item.category,
        amount: item._sum.amount,
        count: item._count
      })),
      recentExpenses: recentExpenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        status: expense.status,
        createdAt: expense.createdAt,
        user: expense.user
      }))
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
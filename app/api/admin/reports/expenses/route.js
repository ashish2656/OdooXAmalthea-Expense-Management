import { NextResponse } from 'next/server'
import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/reports/expenses - Generate expense reports
export async function GET(request) {
  const authResult = await authMiddleware(request)
  if (authResult instanceof NextResponse) return authResult

  const roleCheck = requireRole('ADMIN', 'MANAGER')(request)
  if (roleCheck instanceof NextResponse) return roleCheck

  const user = getUserFromRequest(request)
  const { searchParams } = new URL(request.url)
  
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const userId = searchParams.get('userId')
  const format = searchParams.get('format') || 'json' // json or csv

  try {
    // Build where clause
    const whereClause = {
      user: { companyId: user.companyId },
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z')
        }
      }),
      ...(status && { status }),
      ...(category && { category }),
      ...(userId && { userId })
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
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate summary statistics
    const summary = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byStatus: expenses.reduce((acc, exp) => {
        acc[exp.status] = (acc[exp.status] || 0) + 1
        return acc
      }, {}),
      byCategory: expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        return acc
      }, {}),
      averageAmount: expenses.length > 0 
        ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length 
        : 0
    }

    if (format === 'csv') {
      // Generate CSV format
      const csvHeaders = [
        'ID', 'User', 'Description', 'Amount', 'Category', 
        'Status', 'Created Date', 'Approved Date', 'Approver'
      ]
      
      const csvRows = expenses.map(expense => [
        expense.id,
        expense.user.name,
        expense.description,
        expense.amount,
        expense.category,
        expense.status,
        expense.createdAt.toISOString().split('T')[0],
        expense.approvedAt?.toISOString().split('T')[0] || '',
        expense.approvals[0]?.approver?.name || ''
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="expense-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      report: {
        summary,
        expenses: expenses.map(expense => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          status: expense.status,
          receiptUrl: expense.receiptUrl,
          createdAt: expense.createdAt,
          approvedAt: expense.approvedAt,
          user: expense.user,
          approvals: expense.approvals
        })),
        filters: {
          startDate,
          endDate,
          status,
          category,
          userId
        }
      }
    })

  } catch (error) {
    console.error('Generate expense report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
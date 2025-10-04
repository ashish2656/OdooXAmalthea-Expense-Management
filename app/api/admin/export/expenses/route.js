import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (authResult.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all expenses with user details
    const expenses = await prisma.expense.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Employee Name',
      'Employee Email',
      'Description',
      'Amount',
      'Currency',
      'Category',
      'Status',
      'Date',
      'Vendor',
      'Receipt URL',
      'Created At',
      'Updated At'
    ]

    const csvRows = expenses.map(expense => [
      expense.id,
      expense.user.name || '',
      expense.user.email || '',
      expense.description || '',
      expense.amount || 0,
      expense.currency || 'INR',
      expense.category || '',
      expense.status || '',
      expense.date ? new Date(expense.date).toLocaleDateString() : '',
      expense.vendor || '',
      expense.receiptUrl || '',
      new Date(expense.createdAt).toLocaleString(),
      new Date(expense.updatedAt).toLocaleString()
    ])

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // Return CSV response
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="expenses-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export expenses' },
      { status: 500 }
    )
  }
}
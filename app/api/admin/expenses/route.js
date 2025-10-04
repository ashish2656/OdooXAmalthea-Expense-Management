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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')

    // Build filter conditions
    const where = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (category && category !== 'all') {
      where.category = category.toUpperCase()
    }
    if (userId) {
      where.userId = parseInt(userId)
    }

    // Fetch expenses with pagination
    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.expense.count({ where })
    ])

    // Calculate summary statistics
    const summaryStats = await prisma.expense.aggregate({
      where,
      _sum: {
        amount: true
      },
      _avg: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Get status breakdown
    const statusBreakdown = await prisma.expense.groupBy({
      by: ['status'],
      where: userId ? { userId: parseInt(userId) } : {},
      _count: {
        status: true
      }
    })

    // Get category breakdown
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: userId ? { userId: parseInt(userId) } : {},
      _count: {
        category: true
      }
    })

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      summary: {
        totalExpenses: summaryStats._count.id,
        totalAmount: summaryStats._sum.amount || 0,
        averageAmount: summaryStats._avg.amount || 0,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {}),
        categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
          acc[item.category] = item._count.category
          return acc
        }, {})
      }
    })

  } catch (error) {
    console.error('Admin expenses fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}
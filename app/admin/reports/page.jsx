'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Calendar, IndianRupee, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AdminReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    avgAmount: 0,
    byStatus: {},
    byCategory: {},
    byUser: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/admin/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
        calculateStats(data.expenses || [])
      } else {
        setError('Failed to fetch expense data')
      }
    } catch (error) {
      setError('Failed to fetch expense data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (expenses) => {
    const stats = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0),
      avgAmount: 0,
      byStatus: {},
      byCategory: {},
      byUser: {}
    }

    stats.avgAmount = stats.totalExpenses > 0 ? stats.totalAmount / stats.totalExpenses : 0

    // Group by status
    expenses.forEach(exp => {
      stats.byStatus[exp.status] = (stats.byStatus[exp.status] || 0) + 1
    })

    // Group by category
    expenses.forEach(exp => {
      stats.byCategory[exp.category] = (stats.byCategory[exp.category] || 0) + 1
    })

    // Group by user
    expenses.forEach(exp => {
      const userName = exp.user?.name || 'Unknown'
      stats.byUser[userName] = (stats.byUser[userName] || 0) + 1
    })

    setStats(stats)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      'TRAVEL': 'Travel',
      'FOOD': 'Food & Meals',
      'ACCOMMODATION': 'Accommodation',
      'TRANSPORTATION': 'Transportation',
      'OFFICE_SUPPLIES': 'Office Supplies',
      'SOFTWARE': 'Software',
      'MARKETING': 'Marketing',
      'OTHER': 'Other'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg font-semibold">Back to Admin Dashboard</span>
            </Link>
            <Button onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Detailed Expense Report</h1>
          <p className="text-slate-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalExpenses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <IndianRupee className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Average Amount</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.avgAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Report Date</p>
                  <p className="text-lg font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Expense Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>Complete list of all expense records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Employee</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-slate-900">{expense.user?.name || 'Unknown'}</div>
                          <div className="text-slate-500 text-xs">{expense.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-900">{expense.description}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">₹{(parseFloat(expense.amount) || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryLabel(expense.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
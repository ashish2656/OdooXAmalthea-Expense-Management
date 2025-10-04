'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Calendar, 
  Upload,
  User,
  LogOut,
  TrendingUp,
  FileText,
  Camera,
  AlertCircle,
  Filter
} from 'lucide-react'

export default function EmployeeDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    thisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showNewExpense, setShowNewExpense] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    receiptUrl: '',
    currency: 'INR',
    vendor: '',
    date: new Date().toISOString().split('T')[0] // Today's date
  })

  const categories = [
    'TRAVEL', 'FOOD', 'ACCOMMODATION', 'TRANSPORTATION', 'OFFICE_SUPPLIES', 'SOFTWARE', 'MARKETING', 'OTHER'
  ]

  const categoryLabels = {
    'TRAVEL': 'Travel',
    'FOOD': 'Food & Meals', 
    'ACCOMMODATION': 'Accommodation',
    'TRANSPORTATION': 'Transportation',
    'OFFICE_SUPPLIES': 'Office Supplies',
    'SOFTWARE': 'Software',
    'MARKETING': 'Marketing',
    'OTHER': 'Other'
  }

  // Fetch user data and expenses
  useEffect(() => {
    fetchUserData()
    fetchExpenses()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/auth')
    }
  }

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses)
        
        // Calculate stats
        const total = data.expenses.length
        const pending = data.expenses.filter(exp => exp.status === 'PENDING').length
        const approved = data.expenses.filter(exp => exp.status === 'APPROVED').length
        const rejected = data.expenses.filter(exp => exp.status === 'REJECTED').length
        
        const currentMonth = new Date().getMonth()
        const thisMonth = data.expenses.filter(exp => 
          new Date(exp.createdAt).getMonth() === currentMonth
        ).length
        
        setStats({ total, pending, approved, rejected, thisMonth })
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitExpense = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          currency: newExpense.currency,
          vendor: newExpense.vendor || 'Unknown',
          date: newExpense.date,
          receiptUrl: newExpense.receiptUrl || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Expense submitted successfully!')
        setNewExpense({ 
          description: '', 
          amount: '', 
          category: '', 
          receiptUrl: '',
          currency: 'INR',
          vendor: '',
          date: new Date().toISOString().split('T')[0]
        })
        setShowNewExpense(false)
        fetchExpenses() // Refresh expenses
      } else {
        setError(data.error || 'Failed to submit expense')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth')
    } catch (error) {
      router.push('/auth')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredExpenses = filterStatus === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.status === filterStatus.toUpperCase())

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Employee Portal</h1>
                <p className="text-sm text-slate-600">{user?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Rejected</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">This Month</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={showNewExpense} onOpenChange={setShowNewExpense}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Submit New Expense</DialogTitle>
                      <DialogDescription>
                        Fill in the details for your expense report
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmitExpense} className="space-y-4">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          required
                          value={newExpense.description}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your expense..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          required
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label htmlFor="vendor">Vendor/Merchant</Label>
                        <Input
                          id="vendor"
                          value={newExpense.vendor}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                          placeholder="Where was this expense incurred?"
                        />
                      </div>

                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          required
                          value={newExpense.date}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newExpense.category} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="receipt">Receipt (Optional)</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="receipt"
                            placeholder="Receipt URL or file path"
                            value={newExpense.receiptUrl}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, receiptUrl: e.target.value }))}
                          />
                          <Button type="button" variant="outline" size="sm">
                            <Camera className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button type="submit" disabled={submitting} className="flex-1">
                          {submitting ? 'Submitting...' : 'Submit Expense'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowNewExpense(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full">
                  <Receipt className="w-4 h-4 mr-2" />
                  Upload Receipt
                </Button>

                <Button variant="outline" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Expenses</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredExpenses.length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No expenses found</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {filterStatus === 'all' ? 'Submit your first expense to get started' : `No ${filterStatus} expenses`}
                      </p>
                    </div>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-slate-900">{expense.description}</h3>
                              <Badge className={getStatusColor(expense.status)}>
                                {expense.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span className="flex items-center">
                                <IndianRupee className="w-4 h-4 mr-1" />
                                ₹{parseFloat(expense.amount || 0).toFixed(2)}
                              </span>
                              <span>{categoryLabels[expense.category] || expense.category}</span>
                              <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                            </div>
                            {expense.receiptUrl && (
                              <div className="mt-2">
                                <a 
                                  href={expense.receiptUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                >
                                  <Receipt className="w-3 h-3 mr-1" />
                                  View Receipt
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}



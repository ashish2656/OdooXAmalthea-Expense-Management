'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield,
  Users, 
  Settings, 
  BarChart3, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  TrendingUp,
  FileText,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  Eye,
  UserPlus
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExpenses: 0,
    pendingApprovals: 0,
    approvedExpensesThisMonth: 0,
    totalExpenseAmount: 0,
    expenseGrowth: 0,
    approvalRules: 0
  })

  // Users management
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [userAction, setUserAction] = useState('') // 'edit' or 'delete'

  // Approval Rules management
  const [approvalRules, setApprovalRules] = useState([])
  const [rulesLoading, setRulesLoading] = useState(false)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [newRule, setNewRule] = useState({ threshold: '', approverId: '' })

  useEffect(() => {
    fetchUserData()
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'rules') {
      fetchApprovalRules()
    }
  }, [activeTab])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.user.role !== 'ADMIN') {
          router.push('/auth')
        }
      } else {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/auth')
    }
  }

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats.overview)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchApprovalRules = async () => {
    try {
      setRulesLoading(true)
      const response = await fetch('/api/admin/approval-rules')
      if (response.ok) {
        const data = await response.json()
        setApprovalRules(data.approvalRules)
      }
    } catch (error) {
      console.error('Error fetching approval rules:', error)
    } finally {
      setRulesLoading(false)
    }
  }

  const handleUserAction = async (user, action) => {
    setSelectedUser(user)
    setUserAction(action)
    setShowUserDialog(true)
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        setSuccess('User role updated successfully!')
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update user')
      }
    } catch (error) {
      setError('Network error. Please try again.')
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

  const exportToCSV = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/export/expenses')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `expenses-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess('CSV exported successfully!')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to export CSV')
      }
    } catch (error) {
      setError('Failed to export CSV. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const viewDetailedReport = () => {
    // Navigate to a detailed report page or open in a new tab
    const reportUrl = `/admin/reports?date=${new Date().toISOString().split('T')[0]}`
    window.open(reportUrl, '_blank')
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'EMPLOYEE': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Admin Portal</h1>
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

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Approval Rules
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Total Users</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600" />
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
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.pendingApprovals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <IndianRupee className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-900">₹{Number(stats.totalExpenseAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <Users className="w-5 h-5 mr-2" />
                    Manage Users
                  </CardTitle>
                  <CardDescription>
                    Add, edit, and manage user accounts and roles
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('rules')}>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Settings className="w-5 h-5 mr-2" />
                    Approval Rules
                  </CardTitle>
                  <CardDescription>
                    Configure expense approval thresholds and rules
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('reports')}>
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-600">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    View Reports
                  </CardTitle>
                  <CardDescription>
                    Generate and export detailed expense reports
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-slate-900">{user.name}</h3>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            {!user.isActive && (
                              <Badge variant="outline" className="text-red-600">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{user.email}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMPLOYEE">Employee</SelectItem>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Approval Rules</CardTitle>
                  <Button onClick={() => setShowRuleDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
                <CardDescription>
                  Configure expense approval thresholds and assigned approvers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rulesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading rules...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvalRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">
                            Expenses above ₹{rule.threshold}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Approved by: {rule.approver.name} ({rule.approver.email})
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {approvalRules.length === 0 && (
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No approval rules configured</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Add rules to automate expense approvals
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Reports</CardTitle>
                <CardDescription>
                  Generate and export detailed expense reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={viewDetailedReport}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                    <Button variant="outline" onClick={exportToCSV} disabled={loading}>
                      <Download className="w-4 h-4 mr-2" />
                      {loading ? 'Exporting...' : 'Export CSV'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  IndianRupee, 
  Users, 
  LogOut,
  TrendingUp,
  FileText,
  AlertCircle,
  Calendar,
  MessageSquare,
  Eye,
  Filter,
  Receipt,
  User
} from 'lucide-react'

export default function ManagerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [approvedApprovals, setApprovedApprovals] = useState([])
  const [rejectedApprovals, setRejectedApprovals] = useState([])
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    thisMonth: 0,
    teamExpenses: 0
  })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalComments, setApprovalComments] = useState('')
  const [approvalAction, setApprovalAction] = useState('') // 'approve' or 'reject'

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

  // Fetch user data and all approval data
  useEffect(() => {
    fetchUserData()
    fetchPendingApprovals()
    fetchApprovedApprovals()
    fetchRejectedApprovals()
    fetchStats()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.user.role !== 'MANAGER' && data.user.role !== 'ADMIN') {
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

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/approvals/pending')
      if (response.ok) {
        const data = await response.json()
        setPendingApprovals(data.approvals || [])
      } else {
        console.error('Failed to fetch pending approvals')
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApprovedApprovals = async () => {
    try {
      const response = await fetch('/api/approvals/approved')
      if (response.ok) {
        const data = await response.json()
        setApprovedApprovals(data.approvals || [])
      } else {
        console.error('Failed to fetch approved approvals')
      }
    } catch (error) {
      console.error('Error fetching approved approvals:', error)
    }
  }

  const fetchRejectedApprovals = async () => {
    try {
      const response = await fetch('/api/approvals/rejected')
      if (response.ok) {
        const data = await response.json()
        setRejectedApprovals(data.approvals || [])
      } else {
        console.error('Failed to fetch rejected approvals')
      }
    } catch (error) {
      console.error('Error fetching rejected approvals:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/approvals/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || {
          totalPending: 0,
          totalApproved: 0,
          totalRejected: 0,
          thisMonth: 0,
          teamExpenses: 0
        })
      } else {
        console.error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApprovalAction = async (approval, action) => {
    setSelectedApproval(approval)
    setApprovalAction(action)
    setApprovalComments('')
    setShowApprovalDialog(true)
  }

  const submitApproval = async () => {
    if (!selectedApproval || !approvalAction) return
    
    if (approvalAction === 'reject' && !approvalComments.trim()) {
      setError('Comments are required when rejecting an expense')
      return
    }

    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      const endpoint = `/api/approvals/${selectedApproval.id}/${approvalAction}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          comments: approvalComments.trim() || undefined 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Expense ${approvalAction}d successfully!`)
        setShowApprovalDialog(false)
        // Refresh all data
        fetchPendingApprovals()
        fetchApprovedApprovals()
        fetchRejectedApprovals()
        fetchStats()
      } else {
        setError(data.error || `Failed to ${approvalAction} expense`)
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setProcessing(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Manager Portal</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalPending}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{stats.totalApproved}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{stats.totalRejected}</p>
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

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              Review and approve expense requests from your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No pending approvals</p>
                  <p className="text-sm text-slate-400 mt-1">
                    All expenses are up to date
                  </p>
                </div>
              ) : (
                pendingApprovals.map((approval) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{approval.expense.user.name}</span>
                          </div>
                          <Badge className={getStatusColor(approval.status)}>
                            {approval.status}
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium text-slate-900 mb-2">{approval.expense.description}</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            ₹{parseFloat(approval.expense.amount || 0).toFixed(2)}
                          </div>
                          <div>{categoryLabels[approval.expense.category] || approval.expense.category}</div>
                          <div>{new Date(approval.expense.createdAt).toLocaleDateString()}</div>
                          <div>{approval.expense.user.email}</div>
                        </div>

                        {approval.expense.receiptUrl && (
                          <div className="mb-4">
                            <a 
                              href={approval.expense.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                              <Receipt className="w-3 h-3 mr-1" />
                              View Receipt
                            </a>
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovalAction(approval, 'approve')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleApprovalAction(approval, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approved Expenses */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
              Approved Expenses
            </CardTitle>
            <CardDescription>
              Recently approved expense requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedApprovals.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No approved expenses yet</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Approved expenses will appear here
                  </p>
                </div>
              ) : (
                approvedApprovals.map((approval) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{approval.expense.user.name}</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            APPROVED
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium text-slate-900 mb-2">{approval.expense.description}</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-2">
                          <div className="flex items-center">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            ₹{parseFloat(approval.expense.amount || 0).toFixed(2)}
                          </div>
                          <div>{categoryLabels[approval.expense.category] || approval.expense.category}</div>
                          <div>{new Date(approval.updatedAt).toLocaleDateString()}</div>
                        </div>

                        {approval.comments && (
                          <div className="mt-2 p-2 bg-green-100 rounded text-sm">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            <strong>Approval Note:</strong> {approval.comments}
                          </div>
                        )}

                        {approval.expense.receiptUrl && (
                          <div className="mt-3">
                            <a 
                              href={approval.expense.receiptUrl} 
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

        {/* Rejected Expenses */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-red-600" />
              Rejected Expenses
            </CardTitle>
            <CardDescription>
              Recently rejected expense requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejectedApprovals.length === 0 ? (
                <div className="text-center py-6">
                  <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No rejected expenses</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Rejected expenses will appear here
                  </p>
                </div>
              ) : (
                rejectedApprovals.map((approval) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-red-200 rounded-lg p-4 bg-red-50 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{approval.expense.user.name}</span>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            REJECTED
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium text-slate-900 mb-2">{approval.expense.description}</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-2">
                          <div className="flex items-center">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            ₹{parseFloat(approval.expense.amount || 0).toFixed(2)}
                          </div>
                          <div>{categoryLabels[approval.expense.category] || approval.expense.category}</div>
                          <div>{new Date(approval.updatedAt).toLocaleDateString()}</div>
                        </div>

                        {approval.comments && (
                          <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            <strong>Rejection Reason:</strong> {approval.comments}
                          </div>
                        )}

                        {approval.expense.receiptUrl && (
                          <div className="mt-3">
                            <a 
                              href={approval.expense.receiptUrl} 
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

        {/* Approval Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {approvalAction === 'approve' ? 'Approve Expense' : 'Reject Expense'}
              </DialogTitle>
              <DialogDescription>
                {selectedApproval && (
                  <>
                    <strong>{selectedApproval.expense.description}</strong> by {selectedApproval.expense.user.name}
                    <br />
                    Amount: ₹{parseFloat(selectedApproval.expense.amount || 0).toFixed(2)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="comments">
                  Comments {approvalAction === 'reject' && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="comments"
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder={
                    approvalAction === 'approve' 
                      ? 'Optional approval comments...' 
                      : 'Please provide reason for rejection...'
                  }
                  required={approvalAction === 'reject'}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={submitApproval} 
                  disabled={processing || (approvalAction === 'reject' && !approvalComments.trim())}
                  className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  style={{ flex: 1 }}
                >
                  {processing ? 'Processing...' : (approvalAction === 'approve' ? 'Approve' : 'Reject')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowApprovalDialog(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}



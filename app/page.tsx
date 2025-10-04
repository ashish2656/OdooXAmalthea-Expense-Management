import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck, 
  Settings, 
  LogIn, 
  UserPlus, 
  TrendingUp, 
  Shield, 
  Clock,
  CheckCircle,
  BarChart3,
  Building2
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-slate-800 rounded-lg shadow-lg">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
            </div>
            <Badge variant="secondary" className="mb-4 px-4 py-2 bg-slate-100 text-slate-700 border-slate-300">
              <Building2 className="w-4 h-4 mr-2" />
              Enterprise Solution
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Expense Management System
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Streamline your expense tracking and approval process with professional-grade tools
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 text-center shadow-md border border-slate-200">
              <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-800">98%</div>
              <div className="text-sm text-slate-600 font-medium">Approval Rate</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md border border-slate-200">
              <Clock className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-800">24h</div>
              <div className="text-sm text-slate-600 font-medium">Avg Process Time</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md border border-slate-200">
              <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-800">100k+</div>
              <div className="text-sm text-slate-600 font-medium">Reports Processed</div>
            </div>
          </div>

          {/* Main Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Employee Portal */}
            <Card className="group hover:shadow-lg transition-all duration-200 bg-white border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors duration-200">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-slate-800">
                  Employee Portal
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Submit and track your expense reports with ease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/employee">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Access Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Manager Portal */}
            <Card className="group hover:shadow-lg transition-all duration-200 bg-white border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors duration-200">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg text-slate-800">
                  Manager Portal
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Review and approve expense requests efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/manager">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Access Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Portal */}
            <Card className="group hover:shadow-lg transition-all duration-200 bg-white border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-100 transition-colors duration-200">
                  <Settings className="w-6 h-6 text-slate-700" />
                </div>
                <CardTitle className="text-lg text-slate-800">
                  Admin Portal
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Manage users and configure system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Access Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Get Started */}
            <Card className="group hover:shadow-lg transition-all duration-200 bg-white border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-100 transition-colors duration-200">
                  <Building2 className="w-6 h-6 text-slate-700" />
                </div>
                <CardTitle className="text-lg text-slate-800">
                  Get Started
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Join our professional platform today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm">
              Trusted by leading companies worldwide • Secure • Compliant • Scalable
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
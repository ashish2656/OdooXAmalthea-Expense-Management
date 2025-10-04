'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Users, Clock, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  const [stats, setStats] = useState({
    approvalRate: '98%',
    avgProcessTime: '24h',
    reportsProcessed: '100k+'
  })

  const portals = [
    {
      id: 'employee',
      title: 'Employee Portal',
      description: 'Submit and track your expense reports with ease',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: ['Submit Expenses', 'Track Status', 'Upload Receipts', 'View History']
    },
    {
      id: 'manager',
      title: 'Manager Portal', 
      description: 'Review and approve expense requests efficiently',
      icon: CheckCircle2,
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      features: ['Approve Expenses', 'Team Reports', 'Analytics', 'Notifications']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">ExpenseFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth?tab=signup">
                <Button size="sm" className="bg-slate-800 hover:bg-slate-900">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">
              🏢 Enterprise Solution
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Expense Management
              <span className="block text-slate-700">System</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Streamline your expense tracking and approval process with 
              professional-grade tools
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 mb-1">{stats.approvalRate}</div>
                <p className="text-slate-600">Approval Rate</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 mb-1">{stats.avgProcessTime}</div>
                <p className="text-slate-600">Avg Process Time</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <CheckCircle2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 mb-1">{stats.reportsProcessed}</div>
                <p className="text-slate-600">Reports Processed</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {portals.map((portal, index) => (
              <Card key={portal.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <CardHeader className={`${portal.bgColor} pb-4`}>
                  <div className={`w-12 h-12 ${portal.color.split(' ')[0]} rounded-lg flex items-center justify-center mb-3`}>
                    <portal.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className={`${portal.textColor} text-xl mb-2`}>
                    {portal.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {portal.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <ul className="space-y-2 mb-6">
                    {portal.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/auth">
                    <Button 
                      className={`w-full ${portal.color} text-white group-hover:scale-105 transition-transform`}
                    >
                      Access Portal
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="text-center border-0 shadow-xl bg-gradient-to-r from-slate-800 to-slate-900">
              <CardContent className="p-8">
                <BarChart3 className="w-16 h-16 text-white mx-auto mb-6" />
                <CardTitle className="text-2xl text-white mb-4">
                  Get Started
                </CardTitle>
                <CardDescription className="text-slate-300 mb-6 text-lg">
                  Join our professional platform today
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth">
                    <Button size="lg" variant="outline" className="bg-white text-slate-800 hover:bg-slate-100">
                      🔐 Log In
                    </Button>
                  </Link>
                  <Link href="/auth?tab=signup">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                      👤 Sign Up
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            Trusted by leading companies worldwide • Secure • Compliant • Scalable
          </p>
        </div>
      </footer>
    </div>
  )
}
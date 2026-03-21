"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Brain, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data for the admin dashboard
const mockStats = {
  totalUsers: 15420,
  totalTests: 28750,
  totalRevenue: 8925.00,
  conversionRate: 3.2,
  avgScore: 108,
  avgTime: 14.5,
}

const mockRecentTests = [
  { id: "1", email: "user1@example.com", score: 125, date: "2024-01-15", status: "completed", paid: true },
  { id: "2", email: "user2@example.com", score: 98, date: "2024-01-15", status: "completed", paid: false },
  { id: "3", email: "user3@example.com", score: 132, date: "2024-01-14", status: "completed", paid: true },
  { id: "4", email: "user4@example.com", score: 105, date: "2024-01-14", status: "completed", paid: false },
  { id: "5", email: "user5@example.com", score: 118, date: "2024-01-13", status: "completed", paid: true },
]

const mockDailyStats = [
  { date: "Mon", tests: 145, revenue: 45 },
  { date: "Tue", tests: 189, revenue: 62 },
  { date: "Wed", tests: 234, revenue: 78 },
  { date: "Thu", tests: 198, revenue: 55 },
  { date: "Fri", tests: 267, revenue: 89 },
  { date: "Sat", tests: 312, revenue: 102 },
  { date: "Sun", tests: 289, revenue: 95 },
]

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("7d")

  const filteredTests = mockRecentTests.filter(test =>
    test.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">IQBase Admin</span>
          </Link>
          <Badge variant="outline">Admin Dashboard</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground">Monitor your platform performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+12%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tests</p>
                    <p className="text-2xl font-bold">{mockStats.totalTests.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+8%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+23%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion</p>
                    <p className="text-2xl font-bold">{mockStats.conversionRate}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>-2%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold">{mockStats.avgScore}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <span>Stable</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Time</p>
                    <p className="text-2xl font-bold">{mockStats.avgTime}m</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>-5%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {mockDailyStats.map((day, index) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div 
                        className="w-full bg-primary/20 rounded-t"
                        style={{ height: `${(day.tests / 350) * 150}px` }}
                      />
                      <div 
                        className="w-full bg-green-500/40 rounded-t"
                        style={{ height: `${(day.revenue / 120) * 50}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary/20 rounded" />
                  <span className="text-sm text-muted-foreground">Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500/40 rounded" />
                  <span className="text-sm text-muted-foreground">Revenue ($)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { range: "130+", label: "Exceptional", count: 2340, color: "bg-purple-500" },
                  { range: "120-129", label: "Superior", count: 4560, color: "bg-blue-500" },
                  { range: "110-119", label: "Above Average", count: 6780, color: "bg-green-500" },
                  { range: "90-109", label: "Average", count: 8920, color: "bg-yellow-500" },
                  { range: "80-89", label: "Below Average", count: 3450, color: "bg-orange-500" },
                  { range: "<80", label: "Development", count: 1700, color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.range} className="flex items-center gap-4">
                    <div className="w-24 text-sm">
                      <span className="font-medium">{item.range}</span>
                      <span className="text-muted-foreground block text-xs">{item.label}</span>
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${(item.count / 8920) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm text-muted-foreground">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tests */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Recent Tests</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">{test.email}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${
                          test.score >= 120 ? 'text-green-500' :
                          test.score >= 100 ? 'text-blue-500' :
                          'text-orange-500'
                        }`}>
                          {test.score}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{test.date}</td>
                      <td className="py-3 px-4">
                        <Badge variant={test.status === 'completed' ? 'success' : 'secondary'}>
                          {test.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={test.paid ? 'success' : 'outline'}>
                          {test.paid ? 'Paid' : 'Free'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

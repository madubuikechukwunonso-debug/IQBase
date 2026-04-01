// src/app/admin/layout.tsx
import { getUser } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Brain, MessageSquare, Mail } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-950 border-r border-border h-screen sticky top-0 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">IQBase Admin</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted text-foreground">
            <Brain className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link href="/admin/reports" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted text-foreground">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>

          <Link href="/admin/newsletter" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted text-foreground">
            <Mail className="w-5 h-5" />
            <span className="font-medium">Newsletter</span>
          </Link>
        </nav>

        <div className="pt-6 border-t">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted text-muted-foreground">
            ← Back to App
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

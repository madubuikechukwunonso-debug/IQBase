// src/app/admin/layout.tsx
import { getUser } from "@/lib/session"
import { redirect } from "next/navigation"

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-950 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">IQBase Admin</h1>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to App</a>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-8">{children}</main>
    </div>
  )
}

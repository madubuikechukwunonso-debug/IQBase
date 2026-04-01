// src/app/admin/layout.tsx
import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, MessageSquare, Mail, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
            IQBase
          </span>
          <span className="text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 px-2.5 py-0.5 rounded-full">
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Brain className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/admin/reports"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>

          <Link
            href="/admin/newsletter"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Newsletter</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to App</span>
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        <main className="max-w-7xl mx-auto p-8">{children}</main>
      </div>
    </div>
  );
}

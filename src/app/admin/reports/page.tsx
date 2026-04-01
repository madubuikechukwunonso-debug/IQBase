"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  const [contactMessages, setContactMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/reports")
      .then(res => res.json())
      .then(data => {
        setContactMessages(Array.isArray(data.messages) ? data.messages : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const replyToMessage = async (messageId: string, replyText: string) => {
    await fetch("/api/admin/contact/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, replyText }),
    })
    // Refresh
    window.location.reload()
  }

  if (loading) return <div className="p-8">Loading reports...</div>

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Contact Reports ({contactMessages.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {contactMessages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No contact messages yet.</p>
          ) : (
            contactMessages.map((msg: any) => (
              <div key={msg.id} className="border rounded-3xl p-6 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{msg.name} • {msg.email}</p>
                    <p className="text-sm text-muted-foreground">{msg.subject}</p>
                  </div>
                  <Badge variant={msg.replied ? "default" : "secondary"}>{msg.replied ? "Replied" : "Pending"}</Badge>
                </div>
                <p className="mt-4 text-gray-700 dark:text-gray-300">{msg.message}</p>
                {msg.replied ? (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-2xl">
                    <p className="text-xs uppercase text-green-600 mb-1">Admin Reply</p>
                    <p className="text-gray-700 dark:text-gray-300">{msg.replyText}</p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <textarea
                      placeholder="Write your reply here..."
                      className="w-full min-h-[120px] p-4 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y text-sm"
                    />
                    <Button onClick={() => replyToMessage(msg.id, "Reply sent from admin dashboard")} className="mt-3">
                      Send Reply
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

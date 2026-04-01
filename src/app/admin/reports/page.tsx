"use client";
import { useState, useEffect } from "react";

export default function ReportsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetch("/api/admin/reports")
      .then(res => res.json())
      .then(setMessages);
  }, []);

  const handleReply = async (id: string) => {
    await fetch("/api/admin/contact/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: id, replyText }),
    });
    setReplyingId(null);
    setReplyText("");
    // Refresh list
    window.location.reload();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Contact Reports</h1>
      <div className="space-y-6">
        {messages.map((msg: any) => (
          <div key={msg.id} className="border rounded-3xl p-6 bg-white dark:bg-gray-800">
            <p className="font-semibold">{msg.name} • {msg.email}</p>
            <p className="text-sm text-gray-500">{msg.subject}</p>
            <p className="mt-4">{msg.message}</p>

            {msg.replied ? (
              <p className="text-green-600 mt-4">✅ Replied: {msg.replyText}</p>
            ) : (
              <button onClick={() => setReplyingId(msg.id)} className="mt-4 text-violet-600 hover:underline">Reply</button>
            )}

            {replyingId === msg.id && (
              <div className="mt-4">
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full border rounded-2xl p-4" rows={3} />
                <button onClick={() => handleReply(msg.id)} className="mt-3 bg-violet-600 text-white px-6 py-3 rounded-2xl">Send Reply</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

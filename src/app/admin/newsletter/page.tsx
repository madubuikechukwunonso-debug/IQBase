"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewsletterPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sendTo, setSendTo] = useState<"all" | "specific">("all");
  const [specificEmails, setSpecificEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!subject || !content) {
      setMessage("Subject and content are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        subject,
        content,
        sendTo: sendTo === "all" ? "all" : { emails: specificEmails.split(",").map(e => e.trim()).filter(Boolean) },
      };

      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Newsletter sent to ${data.sentCount || "multiple"} recipients!`);
        setSubject("");
        setContent("");
        setSpecificEmails("");
      } else {
        setMessage(data.error || "Failed to send newsletter");
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Send Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            placeholder="Newsletter Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            rows={12}
            placeholder="Write your newsletter content here... (HTML supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y text-sm"
          />

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={sendTo === "all"} 
                onChange={() => setSendTo("all")} 
              /> 
              All users
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={sendTo === "specific"} 
                onChange={() => setSendTo("specific")} 
              /> 
              Specific emails only
            </label>
          </div>

          {sendTo === "specific" && (
            <Input
              placeholder="Enter emails separated by commas"
              value={specificEmails}
              onChange={(e) => setSpecificEmails(e.target.value)}
            />
          )}

          {message && (
            <div className={`p-4 rounded-2xl ${message.includes("✅") ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"}`}>
              {message}
            </div>
          )}

          <Button 
            onClick={handleSend} 
            disabled={loading || !subject || !content}
            className="w-full py-6 text-lg"
          >
            {loading ? "Sending..." : "Send Newsletter Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

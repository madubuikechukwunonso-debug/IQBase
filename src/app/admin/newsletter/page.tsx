"use client";
import { useState } from "react";

export default function NewsletterPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [toAll, setToAll] = useState(true);
  const [emails, setEmails] = useState("");

  const sendNewsletter = async () => {
    await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        body,
        toAll,
        specificEmails: emails.split(",").map(e => e.trim()),
      }),
    });
    alert("Newsletter sent!");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Send Newsletter</h1>
      <div className="max-w-2xl space-y-6">
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full px-5 py-4 rounded-3xl border" />
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} placeholder="Newsletter body..." className="w-full px-5 py-4 rounded-3xl border" />
        
        <div className="flex gap-4">
          <label>
            <input type="radio" checked={toAll} onChange={() => setToAll(true)} /> All users
          </label>
          <label>
            <input type="radio" checked={!toAll} onChange={() => setToAll(false)} /> Specific emails
          </label>
        </div>

        {!toAll && (
          <input value={emails} onChange={e => setEmails(e.target.value)} placeholder="email1@example.com, email2@example.com" className="w-full px-5 py-4 rounded-3xl border" />
        )}

        <button onClick={sendNewsletter} className="w-full py-4 bg-emerald-600 text-white rounded-3xl">Send Newsletter</button>
      </div>
    </div>
  );
}

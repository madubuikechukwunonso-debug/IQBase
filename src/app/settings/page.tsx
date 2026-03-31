"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    setLoading(true);
    alert("Profile updated successfully!");
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    alert("Password changed successfully!");
    setLoading(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="px-6 py-5 border-b">
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>

          <div className="p-6 space-y-10">
            {/* Profile Section */}
            <div>
              <h2 className="font-semibold mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Name</span>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* Security Section */}
            <div>
              <h2 className="font-semibold mb-4">Security</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Current Password</span>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">New Password</span>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Confirm New Password</span>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <Button onClick={handleChangePassword} disabled={loading} className="w-full">
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

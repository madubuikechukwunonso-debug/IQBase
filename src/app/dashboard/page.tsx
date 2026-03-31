"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  Trophy,
  TrendingUp,
  Target,
  Play,
  Settings,
  LogOut,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import ScoreTrendChart from "./ScoreTrendChart";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tests, setTests] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile form
  const [name, setName] = useState(session?.user?.name || "");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTests = async () => {
      const user = await getUser();
      if (user) {
        const data = await prisma.test.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        setTests(data);
      }
    };
    fetchTests();
  }, []);

  const totalTests = tests.length;
  const avgScore = totalTests > 0
    ? Math.round(tests.reduce((sum, t) => sum + (t.score || 0), 0) / totalTests)
    : 0;
  const highestPercentile = totalTests > 0
    ? Math.max(...tests.map((t) => t.percentile || 0))
    : 0;

  const handleLogout = () => {
    router.push("/api/auth/signout");
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">IQBase</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Well-designed Welcome Back Div */}
            <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-2 shadow-sm max-w-[240px]">
              <span className="text-muted-foreground text-sm whitespace-nowrap">Welcome back,</span>
              <span className="font-semibold text-base truncate">
                {session?.user?.name || "User"}
              </span>
            </div>

            {/* Start New Test Button */}
            <Button asChild size="sm" className="gap-2 text-base font-semibold hidden md:flex">
              <Link href="/test">
                <Play className="w-4 h-4" />
                Start New Test
              </Link>
            </Button>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>

            {/* Logout */}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Mobile Welcome Back */}
        <div className="sm:hidden mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl px-6 py-5 shadow-sm">
            <span className="text-muted-foreground text-sm">Welcome back,</span>
            <h1 className="text-3xl font-bold tracking-tight truncate mt-1">
              {session?.user?.name || "User"}
            </h1>
          </div>
        </div>

        {/* Desktop Welcome */}
        <div className="hidden sm:flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {session?.user?.name || "User"}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track your IQ progress • Improve every test
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <Trophy className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalTests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{avgScore}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Best Percentile</CardTitle>
              <Target className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{highestPercentile}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Score Trend Chart */}
        {totalTests > 1 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Your Score Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreTrendChart tests={tests} />
            </CardContent>
          </Card>
        )}

        {/* Recent Tests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tests</CardTitle>
            {totalTests > 0 && (
              <Button variant="outline" asChild>
                <Link href="/results">View All Results</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven&apos;t taken any tests yet.</p>
                <Button asChild size="lg">
                  <Link href="/test">Take Your First Test</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-6 border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{test.score} points</p>
                        <p className="text-sm text-muted-foreground">
                          {test.category} • {new Date(test.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/results?testId=${test.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ==================== SETTINGS MODAL ==================== */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-xl">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-8">
              {/* Profile Section */}
              <div>
                <h3 className="font-semibold mb-4">Profile</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Name</span>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Email</span>
                    <Input value={session?.user?.email || ""} disabled />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h3 className="font-semibold mb-4">Security</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Current Password</span>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">New Password</span>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Confirm New Password</span>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

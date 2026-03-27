"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain } from "lucide-react";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      setError("Please fill in both email and password");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password"
          : "Login failed. Please try again."
      );
      setLoading(false);
      return;
    }

    if (result?.ok) {
      router.refresh();
      router.push(callbackUrl);
    }

    setLoading(false);
  }

  const handleForgotPassword = async () => {
    const email = prompt("Enter your email address to receive a reset link:");
    if (!email) return;

    setLoading(true);
    const result = await signIn("email", {
      email: email.trim(),
      redirect: false,
    });
    setLoading(false);

    if (result?.ok) {
      alert("✅ Magic reset link sent to your email! Check your inbox.");
    } else {
      alert("Failed to send reset link. Please try again.");
    }
  };

  const handleSocialSignIn = (provider: string) => {
    setLoading(true);
    setError(null);
    signIn(provider, { callbackUrl, redirect: true });
  };

  return (
    <div className="max-w-md w-full space-y-8">
      {/* Homepage Logo */}
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <span className="font-bold text-3xl tracking-tight">IQBase</span>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Register
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
              placeholder="Password"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/30 p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in with Email"
            )}
          </button>
        </div>

        {/* FIXED Forgot Password Button */}
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Forgot your password?
          </button>
        </div>
      </form>

      {/* Social login separator */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social sign-in buttons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleSocialSignIn("google")}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors ${
            loading ? "cursor-not-allowed" : ""
          }`}
        >
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.92c-.25 1.37-1.01 2.53-2.14 3.3v2.72h3.45c2.01-1.85 3.17-4.58 3.17-7.78z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.45-2.72c-.98.66-2.23 1.06-3.83 1.06-2.95 0-5.45-1.99-6.34-4.66H2.04v2.9C3.85 20.15 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.66 14.57c-.23-.66-.36-1.37-.36-2.12 0-.75.13-1.46.36-2.12v-2.9H2.04C1.37 10.1 1 11.52 1 13c0 1.48.37 2.9 1.04 4.1l2.62-2.53z"/>
              <path fill="#EA4335" d="M12 5.48c1.65 0 3.13.57 4.3 1.68l3.2-3.2C17.46 2.09 14.94 1 12 1 7.7 1 3.85 3.85 2.04 7.9l2.62 2.53C5.55 7.47 8.5 5.48 12 5.48z"/>
            </svg>
            Google
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialSignIn("facebook")}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors ${
            loading ? "cursor-not-allowed" : ""
          }`}
        >
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
            Facebook
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialSignIn("twitter")}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors ${
            loading ? "cursor-not-allowed" : ""
          }`}
        >
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.056l-5.512-7.207-6.304 7.207H1.32l8.588-9.81L0 1.153h7.265l4.99 6.6L18.901 1.153zM19.13 20.78h2.04L7.26 3.22H5.1l14.03 17.56z"/>
            </svg>
            X
          </span>
        </button>
      </div>
    </div>
  );
}

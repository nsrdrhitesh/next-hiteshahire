"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    user: {
      id: number;
      staffId: string;
      firstName: string;
      lastName: string;
      email: string;
      permissions: {
        id: number;
        resource: string;
        action: string;
        name: string;
        source: string;
      }[];
    };
    expiresIn: number;
  };
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export default function AdminLogin() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // console.log("Okay Test Data :- ");
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (response.status === 400) {
          // Validation error
          const errorMsg = Array.isArray(data.message) 
            ? data.message.join(", ")
            : data.message || "Validation failed";
          setError(errorMsg);
        } else if (response.status === 401) {
          // Invalid credentials
          const errorMsg = Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Invalid email or password";
          setError(errorMsg);
        } else if (response.status === 404) {
          setError("User not found");
        } else if (response.status === 429) {
          setError("Too many attempts. Please try again later.");
        } else {
          const errorMsg = Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Login failed. Please try again.";
          setError(errorMsg);
        }
        setIsLoading(false);
        return;
      }

      if (data.success && data.data) {
        // Store tokens and user data
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem("refresh_token", data.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("selected_platform_id", (data.data.user as any).platforms?.[0]?.id || []);
        // console.log("platforms", JSON.stringify(data.data.user.platforms[0].id || []));
        // console.log("platforms", JSON.stringify((data.data.user as any).platforms?.[0]?.id || []));
        // Set token expiration
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + data.data.expiresIn);
        localStorage.setItem("expires_at", expiresAt.toISOString());

        // Show success message
        setSuccessMessage(`Welcome back, ${data.data.user.firstName}!`);

        // For demo: Check if user has 2FA enabled (you'll need to adjust this based on your API)
        // For now, we'll simulate 2FA check
        const userHas2FA = false; // Replace with actual check from API response

        if (userHas2FA) {
          setIsTwoFactor(true);
          setIsLoading(false);
        } else {
          // Redirect to admin dashboard after a brief delay
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 1500);
        }
      } else {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Login failed";
        setError(errorMsg);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check your connection.");
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Here you would call your 2FA verification API
      // For example: http://localhost:3003/api/auth/verify-2fa
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      // After successful 2FA verification, redirect
      router.push('/admin/dashboard');
    } catch (error) {
      setError("Two-factor authentication failed");
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (isTwoFactor) {
      await handleTwoFactorSubmit(e);
    } else {
      await handleLogin(e);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 font-sans dark:from-gray-900 dark:via-black dark:to-purple-900/20">
      <div className="relative w-full max-w-6xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute left-6 top-6 z-50 flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        <div className="grid min-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 md:grid-cols-2">
          {/* Left Side - Login Form */}
          <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16">
            <div className="mx-auto w-full max-w-md">
              {/* Logo & Header */}
              <div className="mb-10 text-center">
                <div className="mb-6 inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Advance Admin Panel
                  </h1>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Admin Portal
                </h2>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  Secure access to administrative controls
                </p>
              </div>

              {/* Security Notice */}
              <div className="mb-8 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.406 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      Enhanced Security Mode Active
                    </p>
                    <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                      This portal requires authentication
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isTwoFactor ? (
                  <>
                    {/* Email Field */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Admin Email
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-xl border border-gray-300 bg-gray-50 p-4 pl-10 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-purple-500"
                          placeholder="admin@example.com"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password
                        </label>
                        <Link
                          href="/admin-reset"
                          className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full rounded-xl border border-gray-300 bg-gray-50 p-4 pl-10 pr-12 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-purple-500"
                          placeholder="••••••••"
                          required
                          minLength={6}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Password must be at least 6 characters
                      </p>
                    </div>
                  </>
                ) : (
                  /* 2FA Section */
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-center text-2xl font-bold tracking-widest text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-purple-500"
                        placeholder="000000"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        Code expires in 30 seconds
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTwoFactor(false)}
                      className="w-full text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      disabled={isLoading}
                    >
                      Use different account
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="flex items-start gap-3">
                      <svg className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.406 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 px-6 py-4 font-semibold text-white transition-all duration-300 hover:from-purple-600 hover:to-pink-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {isTwoFactor ? "Verifying..." : "Authenticating..."}
                    </span>
                  ) : (
                    isTwoFactor ? "Verify & Continue" : "Sign In"
                  )}
                </button>
              </form>

              {/* Security Info */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>All activities are logged and monitored</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>End-to-end encrypted connection</span>
                </div>
              </div>

              {/* Support Link */}
              <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Need help?{" "}
                <Link
                  href="/admin-support"
                  className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  Contact Super Admin
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Admin Dashboard Preview */}
          <div className="relative hidden bg-gradient-to-br from-purple-600 to-pink-500 md:block">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative flex h-full flex-col justify-between p-12">
              {/* Admin Tools Preview */}
              <div className="mt-20">
                <div className="mb-8 inline-flex items-center rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <span className="text-sm font-medium text-white">
                    System Access Level: Administrator
                  </span>
                </div>
                <h3 className="mb-6 text-2xl font-bold text-white">
                  Complete System Control
                </h3>
                
                {/* Dashboard Mockup */}
                <div className="space-y-4">
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20"></div>
                        <div>
                          <p className="font-medium text-white">System Dashboard</p>
                          <p className="text-sm text-white/70">Live monitoring & analytics</p>
                        </div>
                      </div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20"></div>
                        <div>
                          <p className="font-medium text-white">User Management</p>
                          <p className="text-sm text-white/70">25,483 active users</p>
                        </div>
                      </div>
                      <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20"></div>
                        <div>
                          <p className="font-medium text-white">Audit Logs</p>
                          <p className="text-sm text-white/70">1,247 events today</p>
                        </div>
                      </div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Military-Grade Encryption</p>
                    <p className="text-sm text-white/80">256-bit SSL/TLS encryption</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Compliance Ready</p>
                    <p className="text-sm text-white/80">GDPR, CCPA, SOC2 compliant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
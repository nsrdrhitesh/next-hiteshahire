"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function UserLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect to dashboard after successful login
    router.push('/user-dashboard');
    setIsLoading(false);
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 font-sans dark:from-gray-900 dark:via-black dark:to-blue-900/20">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Advance Admin Panel
                  </h1>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome Back
                </h2>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  Sign in to your account to continue your journey
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 p-4 pl-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                      placeholder="name@example.com"
                      required
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
                      href="/forgot-password"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
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
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 p-4 pl-10 pr-12 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
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
                </div>

                {/* Remember Me & Terms */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-cyan-500 hover:shadow-lg disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="relative hidden bg-gradient-to-br from-blue-500 to-cyan-400 md:block">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative flex h-full flex-col justify-between p-12">
              {/* Quote Section */}
              <div className="mt-20">
                <div className="mb-8 inline-flex items-center rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <span className="text-sm font-medium text-white">
                    Trusted by 50,000+ couples
                  </span>
                </div>
                <blockquote className="mb-6 text-2xl font-bold text-white">
                  "Finding your soulmate was never this meaningful. Our platform connects hearts that are meant to be together."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm"></div>
                  <div>
                    <p className="font-medium text-white">Sarah Johnson</p>
                    <p className="text-sm text-white/80">Founder, Everlasting Matches</p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Verified Profiles</p>
                    <p className="text-sm text-white/80">100% authentic profiles with verified credentials</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Privacy First</p>
                    <p className="text-sm text-white/80">Your data is encrypted and protected</p>
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
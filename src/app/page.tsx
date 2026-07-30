"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleUserLogin = () => {
    // Navigate to user login page
    router.push('/user/login');
  };

  const handleAdminLogin = () => {
    // Navigate to admin login page
    router.push('/admin/login');
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-blue-50 font-sans dark:from-gray-900 dark:via-black dark:to-gray-900">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-20 px-6 sm:px-16">
        {/* Logo Section */}
        <div className="flex w-full items-center justify-between">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
          <div className="hidden text-sm text-zinc-600 dark:text-zinc-400 sm:block">
            Advance Admin Panel
          </div>
        </div>

        {/* Main Content */}
        <div className="flex w-full flex-col items-center gap-12">
          {/* Hero Section */}
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 opacity-20 blur-xl dark:opacity-30"></div>
              <h1 className="relative text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Advance Admin Panel
                </span>
              </h1>
            </div>
            <div className="relative">
              <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                Find Your Perfect Match. Not Just a Profile.
              </p>
              <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                Designed for Relationships That Last.
              </p>
            </div>
          </div>

          {/* Login Cards Section */}
          <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-2">
            {/* User Login Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:border-zinc-800 dark:bg-gray-900">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-100 opacity-20 transition-all duration-500 group-hover:scale-150 group-hover:opacity-30 dark:bg-blue-900"></div>
              
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Login</h2>
                </div>
                
                <p className="mb-8 text-zinc-600 dark:text-zinc-300">
                  Access your personal documents, collaborate with team members, and manage your workspace.
                </p>
                
                <button 
                  onClick={handleUserLogin}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-cyan-500 hover:shadow-lg active:scale-95"
                >
                  Sign In as User
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure & Encrypted Access</span>
                </div>
              </div>
            </div>

            {/* Admin Login Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:border-zinc-800 dark:bg-gray-900">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-100 opacity-20 transition-all duration-500 group-hover:scale-150 group-hover:opacity-30 dark:bg-purple-900"></div>
              
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
                </div>
                
                <p className="mb-8 text-zinc-600 dark:text-zinc-300">
                  Manage system settings, user permissions, audit logs, and oversee the entire document management system.
                </p>
                
                <button 
                  onClick={handleAdminLogin}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 px-6 py-4 font-semibold text-white transition-all duration-300 hover:from-purple-600 hover:to-pink-500 hover:shadow-lg active:scale-95"
                >
                  Sign In as Admin
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Enhanced Security & Controls</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex w-full max-w-md items-center gap-4">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">OR</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              Need help accessing your account?
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Reset Password
              </a>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <a 
                href="#" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Contact Support
              </a>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <a 
                href="#" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                System Status
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex w-full flex-col items-center gap-4 text-center">
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300">
              Privacy Policy 002
            </a>
            <a href="#" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300">
              Terms of Service 002
            </a>
            <a href="#" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300">
              Documentation 001
            </a>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            © {new Date().getFullYear()} DMS. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
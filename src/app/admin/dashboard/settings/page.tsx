"use client";

import Link from "next/link";

export default function AdminUserPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center max-w-lg">
        
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <svg
              className="h-10 w-10 text-purple-600 dark:text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Page In Progress 🚧
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          The <span className="font-semibold">Admin Staff Management</span> module
          is currently under development.  
          Please check back later.
        </p>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-white font-medium shadow hover:from-purple-700 hover:to-pink-600"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
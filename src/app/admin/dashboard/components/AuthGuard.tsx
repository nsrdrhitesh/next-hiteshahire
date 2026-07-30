"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        const user = localStorage.getItem("user");

        const hasValidAuth = !!(accessToken && refreshToken && user);

        if (!hasValidAuth) {
          setShowModal(true);
        }

        setIsAuthenticated(hasValidAuth);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setShowModal(true);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    
    // Optional: Listen for storage changes
    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLoginRedirect = () => {
    router.push("/admin/login");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/admin/login");
  };

  // Show nothing while checking
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show modal if not authenticated
  return (
    <>
      {/* Error Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            {/* Error Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.33 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Message */}
            <h2 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
              You are not logged in. Please log in to access the dashboard.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleLoginRedirect}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Go to Login
              </button>
              <button
                onClick={handleCloseModal}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
              >
                Close
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
              <p className="font-medium">What happened?</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Your session may have expired</li>
                <li>You might not be properly logged in</li>
                <li>Authentication tokens are missing</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Background content (blurred) */}
      <div className="blur-sm">
        {children}
      </div>
    </>
  );
}
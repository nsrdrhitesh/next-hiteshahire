"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NavbarProps {
  onMenuClick: () => void;
}

interface Platform {
  id: number;
  name: string;
  code: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
  roles: Role[];
}


export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<number | null>(null);

  // const handleLogout = () => {
  //   // Add logout logic here
  //   router.push("/");
  // };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const userPlatforms = parsedUser.platforms || [];

        setPlatforms(userPlatforms);

        // Set first platform as default selected
        if (userPlatforms.length > 0) {
          setSelectedPlatformId(userPlatforms[0].id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, []);


  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // const router = useRouter();

  const handleOptionSelect = (platform: Platform) => {
    setSelectedPlatformId(platform.id);
    setSearchDropdownOpen(false);
    
    // Optional: store selected platform in localStorage
    localStorage.setItem("selected_platform_id", platform.id.toString());
    router.push("/admin/dashboard");
    router.refresh();
  };


    const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log("logoyt process start");
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      console.log("logoyt process start");
      // Call logout API to blacklist tokens
      if (accessToken) {
        await fetch("http://localhost:3003/api/auth/logout", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
      
      // Clear all localStorage items
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("selected_platform_id");
      
      // Redirect to login page
      router.push('/admin/login');
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Force clear and redirect even on error
      localStorage.clear();
      router.push('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 lg:hidden"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

       {/* Search Dropdown */}
      <div className="ml-4 flex flex-1 items-center lg:ml-0">
        <div className="relative w-full max-w-xs">
          <button
            onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 py-2 pl-3 pr-2 text-left text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <div className="flex items-center">
              {/* <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg> */}
              <span>
                {platforms.find(p => p.id === selectedPlatformId)?.name || "Select Platform"}
              </span>
            </div>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
                searchDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {searchDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleOptionSelect(platform)}
                  className={`flex w-full items-center px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedPlatformId === platform.id
                      ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {platform.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {/* <div className="ml-4 flex flex-1 items-center lg:ml-0">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search users, matches, payments..."
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div> */}

      {/* Right Side Actions */}
      <div className="ml-4 flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                <button className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400">
                  Mark all as read
                </button>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New user registration</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sarah Johnson just registered</p>
                  <p className="mt-1 text-xs text-gray-500">2 min ago</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Payment successful</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Premium subscription activated</p>
                  <p className="mt-1 text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-purple-400 to-pink-300">
              {userData?.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userData ? `${userData.firstName} ${userData.lastName}` : "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userData?.roles?.[0]?.name || "Role"}
              </p>
            </div>
            <svg
              className={`h-5 w-5 text-gray-500 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <Link
                href="/admin-dashboard/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Profile
              </Link>
              <Link
                href="/admin-dashboard/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
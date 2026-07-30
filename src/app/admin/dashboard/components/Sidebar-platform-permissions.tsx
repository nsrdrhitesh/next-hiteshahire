"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from 'next/navigation';

interface SidebarProps {
  onClose?: () => void;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  permissions: Permission[];
}

interface Platform {
  id: number;
  name: string;
  code: string;
  permissions: Permission[];
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
  roles: Role[];
  platforms: Platform[];
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<Permission[]>([]);

  // Load user + set default platform (first one or saved one)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const parsed: User = JSON.parse(storedUser);
      setUserData(parsed);

      // Load previously selected platform (or default to first one)
      const savedCode = localStorage.getItem("selectedPlatformCode");
      let platform = parsed.platforms[0];

      if (savedCode) {
        const found = parsed.platforms.find((p) => p.code === savedCode);
        if (found) platform = found;
      }

      setSelectedPlatform(platform);
    } catch (e) {
      console.error("Error parsing user data", e);
    }
  }, []);

  // When selected platform changes → recalculate permissions
  useEffect(() => {
    if (!userData || !selectedPlatform) return;

    const rolePerms = userData.roles.flatMap((r) => r.permissions || []);
    const platformPerms = selectedPlatform.permissions || [];

    // Merge and remove duplicates by id
    const merged = Array.from(
      new Map([...rolePerms, ...platformPerms].map((p) => [p.id, p])).values()
    );

    setCurrentPermissions(merged);
    localStorage.setItem("permissions", JSON.stringify(merged)); // keep your old key if needed
  }, [userData, selectedPlatform]);

  const hasPermission = (resource: string, action: string) =>
    currentPermissions.some(
      (p) => p.resource === resource && p.action === action
    );

  // ====================== SUBMENUS (only show if permission exists) ======================
  const blogsSubmenu = [
    ...(hasPermission("blogs", "index")
      ? [{ title: "Blogs", path: "/admin/dashboard/blogs" }]
      : []),
    ...(hasPermission("categories", "index")
      ? [{ title: "Categories", path: "/admin/dashboard/blogs/categories" }]
      : []),
  ];

  const DomainSubmenu = [
    ...(hasPermission("domain-branding", "index")
      ? [{ title: "Branding", path: "/admin/dashboard/domain-manage/branding" }]
      : []),
    ...(hasPermission("domain-seo-codes", "index")
      ? [{ title: "SEO Codes", path: "/admin/dashboard/domain-manage/seo-codes" }]
      : []),
    ...(hasPermission("domain-social-accounts", "index")
      ? [{ title: "Social Accounts", path: "/admin/dashboard/domain-manage/social-accounts" }]
      : []),
    ...(hasPermission("domain-payment-config", "index")
      ? [{ title: "Payment Config", path: "/admin/dashboard/domain-manage/payment-config" }]
      : []),
  ];

  const staffSubmenu = [
    ...(hasPermission("staff", "index")
      ? [{ title: "Staff Users", path: "/admin/dashboard/users" }]
      : []),
    ...(hasPermission("roles", "index")
      ? [{ title: "Roles", path: "/admin/dashboard/users/roles" }]
      : []),
  ];

  const systemSettingsSubmenu = [
    ...(hasPermission("platforms", "index")
      ? [{ title: "Platforms Settings", path: "/admin/dashboard/settings/platforms" }]
      : []),
  ];

  const menuItems = [
    {
      title: "Dashboard",
      icon: (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>),
      path: "/admin/dashboard",
    },
    ...(blogsSubmenu.length > 0
      ? [
          {
            title: "Blogs",
            icon: (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
            </svg>),
            submenu: blogsSubmenu,
          },
        ]
      : []),
    ...(staffSubmenu.length > 0
      ? [
          {
            title: "Admin Users",
            icon: (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>),
            submenu: staffSubmenu,
          },
        ]
      : []),
    ...(DomainSubmenu.length > 0
      ? [
          {
            title: "Domain Management",
            dashPath: "/admin/dashboard/domain-manage",
            icon: (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
            </svg>),
            submenu: DomainSubmenu,
          },
        ]
      : []),
    ...(systemSettingsSubmenu.length > 0
      ? [
          {
            title: "System Settings",
            icon: (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>),
            submenu: systemSettingsSubmenu,
          },
        ]
      : []),
  ];

  const toggleSubmenu = (title: string) => {
    const isExpanded = expandedMenu === title;
    setExpandedMenu(isExpanded ? null : title);

    const item = menuItems.find((i) => i.title === title);
    if (item?.dashPath && !isExpanded) {
      router.push(item.dashPath);
    }
  };

  const isActive = (path: string) =>
    pathname === path ||
    pathname.startsWith(path + "/create") ||
    pathname.startsWith(path + "/edit") ||
    pathname.startsWith(path + "/view");

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const newPlatform = userData?.platforms.find((p) => p.code === code);
    if (newPlatform) {
      setSelectedPlatform(newPlatform);
      localStorage.setItem("selectedPlatformCode", code);
    }
  };

  const handleLogout = async () => { /* your existing logout logic */ };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      {/* Logo + Platform Switcher */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6 dark:border-gray-700">
        <div className="flex items-center gap-3 flex-1">
          {/* Logo */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
            {/* your logo svg */}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Advance Admin Panel</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
          </div>
        </div>

        {/* PLATFORM SWITCHER */}
        {userData && userData.platforms.length > 1 && (
          <select
            value={selectedPlatform?.code || ""}
            onChange={handlePlatformChange}
            className="ml-4 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {userData.platforms.map((plat) => (
              <option key={plat.id} value={plat.code}>
                {plat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin ...">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.path ? (
              <Link href={item.path} onClick={onClose} className={`flex items-center gap-3 rounded-lg px-4 py-3 ... ${isActive(item.path) ? "active" : ""}`}>
                {item.icon} {item.title}
              </Link>
            ) : (
              <div>
                <button
                  onClick={() => toggleSubmenu(item.title)}
                  className={`flex w-full items-center justify-between ... ${expandedMenu === item.title ? "bg-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon} {item.title}
                  </div>
                  <svg className={`h-4 w-4 transition-transform ${expandedMenu === item.title ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedMenu === item.title && item.submenu && (
                  <div className="ml-8 mt-1 space-y-1 border-l pl-3">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.path}
                        onClick={onClose}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 ... ${isActive(sub.path) ? "text-purple-700" : ""}`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${isActive(sub.path) ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User + Logout (unchanged) */}
      {/* ... your existing bottom section ... */}
    </div>
  );
}
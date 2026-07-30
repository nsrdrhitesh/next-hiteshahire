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
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  department: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  bio: string;
  status: string;
  joinDate: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  platforms: Platform[];
}

interface Permissions {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);

  const loadPermissionsFromStorage = (): Permissions[] => {
    const storedUser = localStorage.getItem("user");
    const selectedPlatformId = localStorage.getItem("selected_platform_id");

    if (!storedUser) return [];

    try {
      const parsedUser: User = JSON.parse(storedUser);

      const mergedRolePermissions =
        parsedUser.roles?.flatMap((role) => role.permissions || []) || [];

      const mergedUserPermissions =
        parsedUser.platforms
          ?.filter((platform) => platform.id === Number(selectedPlatformId))
          .flatMap((platform) => platform.permissions || []) || [];

      const uniquePermissions = Array.from(
        new Map(
          [...mergedRolePermissions, ...mergedUserPermissions].map((p) => [p.id, p])
        ).values()
      );

      localStorage.setItem("permissions", JSON.stringify(uniquePermissions));

      return uniquePermissions;
    } catch (error) {
      console.error("Permission parsing error:", error);
      return [];
    }
  };

  useEffect(() => {
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  
    const perms = loadPermissionsFromStorage();
    setPermissions(perms);
  
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);
  
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "selected_platform_id") {
        setSelectedPlatformId(event.newValue);
      }
    };
  
    window.addEventListener("storage", handleStorageChange);
  
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem("selected_platform_id");
    
      setSelectedPlatformId((prev) => {
        if (prev !== current) {
          return current;
        }
        return prev;
      });
    }, 500);
  
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!selectedPlatformId) return;
  
    const perms = loadPermissionsFromStorage();
  
    setPermissions(perms);
  
    // reset sidebar UI
    setExpandedMenu(null);
    router.refresh();
  }, [selectedPlatformId]);

  const hasPermission = (resource: string, action: string) => {
    return permissions.some(
      (permission) =>
        permission.resource === resource &&
        permission.action === action
    );
  };

  const blogsSubmenu = [
    ...(hasPermission("blogs", "index")
      ? [{ title: "Blogs", path: "/admin/dashboard/blogs" }]
      : []),
  
    ...(hasPermission("categories", "index")
      ? [{ title: "Categories", path: "/admin/dashboard/blogs/categories" }]
      : []),
  ];

  const memberSubmenu = [
    ...(hasPermission("admin-member", "index")
      ? [{ title: "Members", path: "/admin/dashboard/members" }]
      : []),
    ...(hasPermission("member-fields", "index")
      ? [{ title: "Member Fields", path: "/admin/dashboard/members/fields" }]
      : []),
    ...(hasPermission("platform-member-fields", "index")
      ? [{ title: "Platform Member Fields", path: "/admin/dashboard/members/platform-member-fields" }]
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

  const planSectionSubmenu = [
    ...(hasPermission("plans", "index")
      ? [{ title: "Plans Management", path: "/admin/dashboard/plans-section/plans" }]
      : []),
    ...(hasPermission("plan-offers", "index")
      ? [{ title: "Plan Offers", path: "/admin/dashboard/plans-section/plan-offers" }]
      : []),
    ...(hasPermission("offer-conditions", "index")
      ? [{ title: "Offer Conditions", path: "/admin/dashboard/plans-section/offer-conditions" }]
      : []),
  ];

  const scheduledCampaignsSubmenu = [
    ...(hasPermission("whatsapp-messages", "index")
      ? [{ title: "WhatsApp Messages", path: "/admin/dashboard/scheduled-campaigns/whatsapp-messages" }]
      : []),
    ...(hasPermission("push-notifications", "index")
      ? [{ title: "Push Notifications", path: "/admin/dashboard/scheduled-campaigns/push-notifications" }]
      : []),
    ...(hasPermission("schedulers", "index")
      ? [{ title: "Schedulers", path: "/admin/dashboard/scheduled-campaigns/schedulers" }]
      : []),
    ...(hasPermission("member-condition", "index")
      ? [{ title: "Member Conditions", path: "/admin/dashboard/scheduled-campaigns/member-condition" }]
      : []),
  ];

  const menuItems = [
    {
      title: "Dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: "/admin/dashboard",
    },
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.623a10 10 0 01-.671.819 8 8 0 01-2.915 1.755 6 6 0 01-3.826.201 4 4 0 01-2.577-1.302 2 2 0 01-.75-1.2" />
    //     </svg>
    //   ),
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    //     </svg>
    //   ),
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    //     </svg>
    //   ),
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    //     </svg>
    //   ),
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    //     </svg>
    //   ),
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    //     </svg>
    //   ),
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    //     </svg>
    //   ),
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    //     </svg>
    //   ),
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
    //     </svg>
    //   ),

    ...(blogsSubmenu.length > 0
    ? [
        {
          title: "Blogs",
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
            </svg>
          ),
          submenu: blogsSubmenu,
        },
      ]
    : []),
    ...(memberSubmenu.length > 0
    ? [
        {
          title: "Members",
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
            </svg>
          ),
          submenu: memberSubmenu,
        },
      ]
    : []),
    ...(staffSubmenu.length > 0
    ? [
        {
          title: "Admin Users",
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          submenu: staffSubmenu,
        },
      ]
    : []),
    ...(DomainSubmenu.length > 0
    ? [
        {
          title: "Domain Management",
          dashPath: "/admin/dashboard/domain-manage",
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
            </svg>
          ),
          submenu: DomainSubmenu,
        },
      ]
    : []),
    ...(planSectionSubmenu.length > 0
    ? [
        {
          title: "Plans Section",
          dashPath: "/admin/dashboard/plans-section",
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          submenu: planSectionSubmenu,
        },
      ]
    : []),
    ...(systemSettingsSubmenu.length > 0
    ? [
        {
          title: "System Settings",
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          submenu: systemSettingsSubmenu,
        },
      ]
    : []),
    ...(scheduledCampaignsSubmenu.length > 0
    ? [
        {
          title: "Scheduled Campaigns",
          dashPath: "/admin/dashboard/scheduled-campaigns",
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          submenu: scheduledCampaignsSubmenu,
        },
      ]
    : []),
    

    
    // {
    //   title: "Admin Users",
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    //     </svg>
    //   ),
    //   submenu: [
    //     { title: "All Admin Staff", path: "/admin/dashboard/users" },
    //     { title: "Roles", path: "/admin/dashboard/users/roles" },
    //     // { title: "Platforms", path: "/admin/dashboard/platforms" },
    //     // { title: "Activity Log", path: "/admin/dashboard/activity-log" },
    //   ],
    // },
    // {
    //   title: "System Settings",
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   submenu: [
    //     { title: "Platforms Settings", path: "/admin/dashboard/settings/platforms" },
    //     // { title: "General Settings", path: "/admin/dashboard/settings/general" },
    //     // { title: "Security Settings", path: "/admin/dashboard/settings/security" },
    //     // { title: "Email Settings", path: "/admin/dashboard/settings/email" },
    //     // { title: "Notification Settings", path: "/admin/dashboard/settings/notifications" },
    //     // { title: "API Management", path: "/admin/dashboard/settings/api" },
    //   ],
    // },
    // {
    //   title: "Audit Logs",
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    //     </svg>
    //   ),
    //   submenu: [
    //     { title: "User Activities", path: "/admin/dashboard/audit/users" },
    //     { title: "Admin Activities", path: "/admin/dashboard/audit/admin" },
    //     { title: "Security Logs", path: "/admin/dashboard/audit/security" },
    //     { title: "System Logs", path: "/admin/dashboard/audit/system" },
    //   ],
    // },
    // {
    //   title: "Help & Support",
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    //     </svg>
    //   ),
    //   submenu: [
    //     { title: "Support Tickets", path: "/admin/dashboard/support/tickets" },
    //     { title: "Knowledge Base", path: "/admin/dashboard/support/knowledge" },
    //     { title: "User Guides", path: "/admin/dashboard/support/guides" },
    //     { title: "Contact Support", path: "/admin/dashboard/support/contact" },
    //   ],
    // },
    // {
    //   title: "Backup & Restore",
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    //     </svg>
    //   ),
    //   path: "/admin/dashboard/backup",
    // },
    // {
    //   title: "Database",
    //   icon: (
    //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    //     </svg>
    //   ),
    //   path: "/admin/dashboard/database",
    // },
  ];

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

  const toggleSubmenu = (title: string) => {
    const isExpanded = expandedMenu === title;
    setExpandedMenu(isExpanded ? null : title);

    // Find the clicked menu item
    const clickedItem = menuItems.find(item => item.title === title);

    // If it has dashPath and we're opening it, navigate
    if (clickedItem?.dashPath && !isExpanded) {
      router.push(clickedItem.dashPath);
    }
  };

  const isActive = (path: string) => {
      return (
        pathname === path ||
        pathname.startsWith(path + "/create") ||
        pathname.startsWith(path + "/edit") ||
        pathname.startsWith(path + "/view")
      );
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

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
    <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      {/* Logo Section */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Advance Panel</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items with Custom Scrollbar */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 
        /* Custom scrollbar styling */
        scrollbar-thin 
        scrollbar-track-gray-100 
        scrollbar-thumb-gray-300 
        hover:scrollbar-thumb-gray-400 
        dark:scrollbar-track-gray-700 
        dark:scrollbar-thumb-gray-600 
        dark:hover:scrollbar-thumb-gray-500
        /* Firefox fallback */
        scrollbar-width: thin
        scrollbar-color: #d1d5db #f3f4f6
        dark:scrollbar-color: #4b5563 #374151">
        
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.path ? (
              <Link
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-purple-100 to-pink-50 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/20 dark:text-purple-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span className={`${isActive(item.path) ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}`}>
                  {item.icon}
                </span>
                {item.title}
              </Link>
            ) : (
              <div>
                <button
                  onClick={() => toggleSubmenu(item.title)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    expandedMenu === item.title
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
                    {item.title}
                  </div>
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      expandedMenu === item.title ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedMenu === item.title && item.submenu && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-gray-200 pl-3 dark:border-gray-700">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.path}
                        onClick={onClose}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive(subItem.path)
                            ? "text-purple-700 dark:text-purple-300"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                      {/* <div className={`h-1.5 w-1.5 rounded-full ${isActive(subItem.path) ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"}`} /> */}
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive(subItem.path)
                            ? "bg-purple-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />

                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Current User & Logout */}
      <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-purple-400 to-pink-300">
            {userData?.profileImage ? (
              <img
                src={userData.profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white font-semibold">
                {userData
                  ? `${userData.firstName?.[0] ?? ""}${userData.lastName?.[0] ?? ""}`
                  : "U"}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userData
                ? `${userData.firstName} ${userData.lastName}`
                : "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userData?.roles?.[0]?.name || "Role"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Logout"
          >
            {isLoggingOut ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
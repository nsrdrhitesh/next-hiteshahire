"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function DomainManageIndexPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
  }, []);

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  const menuItems = [
    hasPermission("domain-branding", "index") && {
      title: "Branding",
      description: "Manage logos, colors and brand identity",
      path: "/admin/dashboard/domain-manage/branding",
    },
    hasPermission("domain-seo-codes", "index") && {
      title: "SEO Codes",
      description: "Configure meta tags, analytics and SEO scripts",
      path: "/admin/dashboard/domain-manage/seo-codes",
    },
    hasPermission("domain-social-accounts", "index") && {
      title: "Social Accounts",
      description: "Manage social media links and integrations",
      path: "/admin/dashboard/domain-manage/social-accounts",
    },
    hasPermission("domain-payment-config", "index") && {
      title: "Payment Config",
      description: "Configure domain-specific payment settings",
      path: "/admin/dashboard/domain-manage/payment-config",
    },
    hasPermission("whatsapp-credentials", "index") && {
      title: "WhatsApp Credentials",
      description: "Manage WhatsApp Business API credentials",
      path: "/admin/dashboard/domain-manage/whatsapp-credentials",
    },
    hasPermission("push-credentials", "index") && {
      title: "Push Credentials",
      description: "Manage push notification credentials",
      path: "/admin/dashboard/domain-manage/push-credentials",
    }
  ].filter(Boolean);
// whatsapp-credentials
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/admin/dashboard"
                className="hover:text-purple-600"
              >
                Dashboard
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              Domain Management
            </li>
          </ol>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Domain Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage branding, SEO, social accounts, and payment configuration
          for domains.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item: any, index: number) => (
          <Link
            key={index}
            href={item.path}
            className="group rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
          >
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 dark:text-white">
                {item.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center text-sm font-medium text-purple-600 group-hover:underline">
                  Manage →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {menuItems.length === 0 && (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            You don’t have permission to access any domain management modules.
          </p>
        </div>
      )}
    </div>
  );
}
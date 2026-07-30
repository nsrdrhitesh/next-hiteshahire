"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutList,
  Star,
  Tag,
  Settings,
  Clock,
  Receipt
} from "lucide-react";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function PlansSectionIndexPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
  }, []);

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  const menuItems = [
    hasPermission("plans", "index") && {
      title: "Plans",
      description: "Create and manage subscription plans",
      path: "/admin/dashboard/plans-section/plans",
      icon: LayoutList,
    },
    hasPermission("plan-features", "index") && {
      title: "Plan Features",
      description: "Define features included in each plan",
      path: "/admin/dashboard/plans-section/plan-features",
      icon: Star,
    },
    hasPermission("plan-offers", "index") && {
      title: "Plan Offers",
      description: "Manage discounts and promotional offers",
      path: "/admin/dashboard/plans-section/plan-offers",
      icon: Tag,
    },
    hasPermission("offer-conditions", "index") && {
      title: "Offer Conditions",
      description: "Control eligibility rules for offers",
      path: "/admin/dashboard/plans-section/offer-conditions",
      icon: Settings,
    },
    hasPermission("durations", "index") && {
      title: "Durations",
      description: "Manage plan durations",
      path: "/admin/dashboard/plans-section/durations",
      icon: Clock,
    },
    hasPermission("gst-settings", "index") && {
      title: "GST Settings",
      description: "Manage tax percentages based on region",
      path: "/admin/dashboard/plans-section/gst-settings",
      icon: Receipt,
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Plans Management"
        // description="Manage subscription plans, features, offers, and GST settings."
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Management" },
        ]}
      />

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item: any, index: number) => (
          <Link
            key={index}
            href={item.path}
            className="group rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
          >
            <div className="space-y-3">
              <div className="text-purple-600">
                <item.icon size={28} strokeWidth={2} />
              </div>
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
            You don't have permission to access any plans management modules.
          </p>
        </div>
      )}
    </div>
  );
}
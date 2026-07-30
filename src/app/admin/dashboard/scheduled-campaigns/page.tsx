"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Bell, 
  Calendar, 
  Settings,
  TrendingUp,
  Users,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  scheduledToday: number;
  pendingApproval: number;
  successRate: number;
}

export default function ScheduledCampaignsDashboard() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    scheduledToday: 0,
    pendingApproval: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const selectedPlatformId = localStorage.getItem("selected_platform_id");
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

      const res = await fetch(
        `${API_URL}/scheduled-campaigns/stats/${selectedPlatformId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setStats(data.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  const menuItems = [
    {
      title: "WhatsApp Campaigns",
      description: "Schedule and manage WhatsApp message campaigns",
      path: "/admin/dashboard/scheduled-campaigns/whatsapp-messages",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-600",
      permission: hasPermission("whatsapp-campaigns", "index"),
    },
    {
      title: "Push Notifications",
      description: "Schedule push notification campaigns for users",
      path: "/admin/dashboard/scheduled-campaigns/push-notification",
      icon: Bell,
      color: "from-blue-500 to-indigo-600",
      permission: hasPermission("push-campaigns", "index"),
    },
    {
      title: "Schedulers",
      description: "Configure campaign scheduling rules",
      path: "/admin/dashboard/scheduled-campaigns/schedulers",
      icon: Calendar,
      color: "from-purple-500 to-pink-600",
      permission: hasPermission("schedulers", "index"),
    },
    {
      title: "Member Conditions",
      description: "Define target audience conditions",
      path: "/admin/dashboard/scheduled-campaigns/member-condition",
      icon: Users,
      color: "from-orange-500 to-red-600",
      permission: hasPermission("member-conditions", "index"),
    },
  ].filter(Boolean);

  const statCards = [
    {
      label: "Total Campaigns",
      value: stats.totalCampaigns,
      icon: Send,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      label: "Active Campaigns",
      value: stats.activeCampaigns,
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "+5%",
    },
    {
      label: "Scheduled Today",
      value: stats.scheduledToday,
      icon: Clock,
      color: "bg-purple-500",
      trend: "Today",
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: "bg-yellow-500",
      trend: stats.successRate > 80 ? "Excellent" : "Good",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Scheduled Campaigns"
        // description="Manage and schedule automated campaigns for WhatsApp and Push Notifications"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {card.trend}
                  </p>
                </div>
                <div className={`rounded-lg ${card.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {menuItems.map((item: any, index: number) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.path}
              className="group rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg bg-gradient-to-r ${item.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-2">
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
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Campaigns Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Campaigns
          </h2>
          <Link
            href="/admin/dashboard/scheduled-campaigns/all"
            className="text-sm text-purple-600 hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Welcome Campaign
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  WhatsApp • Scheduled for tomorrow
                </p>
              </div>
            </div>
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              Pending
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Daily Digest
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Push Notification • Active
                </p>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Birthday Campaign
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Scheduled • Weekly
                </p>
              </div>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Scheduled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
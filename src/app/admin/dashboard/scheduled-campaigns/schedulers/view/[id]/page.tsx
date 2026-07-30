"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  UserCheck,
  UserPlus,
  Info
} from "lucide-react";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { showSuccess } from "../../../../lib/swalHelper";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface Scheduler {
  id: number;
  platformId: number;
  name: string;
  scheduleTime: string | null;
  scheduleDate: string | null;
  scheduleFromDate: string | null;
  scheduleToDate: string | null;
  afterRegistrationMin: string | null;
  afterApprovalMin: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function ViewScheduler() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [scheduler, setScheduler] = useState<Scheduler | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);

  // const hasPermission = (resource: string, action: string) =>
  //   permissions.some((p) => p.resource === resource && p.action === action);

  useEffect(() => {
    const fetchScheduler = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/scheduled-campaigns/schedulers/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load scheduler");

        const result = await res.json();
        setScheduler(result.data);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchScheduler();
  }, [id, router, API_URL]);

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getScheduleType = (): { type: string; icon: any; description: string } => {
    if (scheduler?.scheduleTime && scheduler?.scheduleDate) {
      return { 
        type: "Specific Date & Time", 
        icon: CalendarIcon, 
        description: `Executes once on ${formatDate(scheduler.scheduleDate)} at ${scheduler.scheduleTime}` 
      };
    }
    if (scheduler?.scheduleTime) {
      return { 
        type: "Daily Schedule", 
        icon: ClockIcon, 
        description: `Executes daily at ${scheduler.scheduleTime}` 
      };
    }
    if (scheduler?.scheduleDate) {
      return { 
        type: "Specific Date", 
        icon: CalendarIcon, 
        description: `Executes on ${formatDate(scheduler.scheduleDate)}` 
      };
    }
    if (scheduler?.scheduleFromDate && scheduler?.scheduleToDate) {
      return { 
        type: "Date Range", 
        icon: CalendarIcon, 
        description: `Executes daily from ${formatDate(scheduler.scheduleFromDate)} to ${formatDate(scheduler.scheduleToDate)}` 
      };
    }
    if (scheduler?.afterRegistrationMin) {
      return { 
        type: "After Registration", 
        icon: UserPlus, 
        description: `${scheduler.afterRegistrationMin} minutes after user registration` 
      };
    }
    if (scheduler?.afterApprovalMin) {
      return { 
        type: "After Approval", 
        icon: UserCheck, 
        description: `${scheduler.afterApprovalMin} minutes after profile approval` 
      };
    }
    return { type: "Manual", icon: Clock, description: "Manual execution only" };
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await showSuccess(`${label} copied to clipboard`);
    } catch (err) {
      console.error("Failed to copy");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading scheduler details...</p>
        </div>
      </div>
    );
  }

  if (error || !scheduler) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Scheduler not found"}
        </p>
      </div>
    );
  }

  const scheduleInfo = getScheduleType();
  const ScheduleIcon = scheduleInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Scheduler Details"
        // description="View and manage scheduler configuration"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Schedulers", href: "/admin/dashboard/scheduled-campaigns/schedulers" },
          { label: "View" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/schedulers",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
            // No permission required for Back button
          },
          {
            href: `/admin/dashboard/scheduled-campaigns/schedulers/edit/${id}`,
            label: "Edit Scheduler",
            icon: <Edit className="h-4 w-4" />,
            variant: 'primary',
            permission: { 
              resource: "schedulers", 
              action: "edit"   // or "edit"
            }
          }
        ]}
        permissions={permissions}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduler Name</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {scheduler.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {scheduler.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      scheduler.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {scheduler.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(scheduler.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(scheduler.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Schedule Configuration
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                    <ScheduleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {scheduleInfo.type}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {scheduleInfo.description}
                    </p>
                  </div>
                </div>
              </div>

              {scheduler.scheduleTime && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Schedule Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {scheduler.scheduleTime}
                  </span>
                </div>
              )}

              {scheduler.scheduleDate && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Schedule Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(scheduler.scheduleDate)}
                  </span>
                </div>
              )}

              {scheduler.scheduleFromDate && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Date Range</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(scheduler.scheduleFromDate)} - {formatDate(scheduler.scheduleToDate)}
                  </span>
                </div>
              )}

              {scheduler.afterRegistrationMin && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">After Registration</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {scheduler.afterRegistrationMin} minutes
                  </span>
                </div>
              )}

              {scheduler.afterApprovalMin && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">After Approval</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {scheduler.afterApprovalMin} minutes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <ul className="space-y-2 text-sm">
              <li>• Use this scheduler in campaigns</li>
              <li>• Test scheduler before enabling</li>
              <li>• Monitor execution logs</li>
              <li>• Adjust timing based on results</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Usage Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Can be used for WhatsApp campaigns</li>
              <li>• Can be used for Push notifications</li>
              <li>• Multiple campaigns can use same scheduler</li>
              <li>• Edit scheduler affects all linked campaigns</li>
            </ul>
          </div>

          <div className="rounded-xl bg-yellow-50 p-6 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Best Practices
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Use descriptive names for easy identification</li>
                  <li>• Test with inactive status first</li>
                  <li>• Avoid peak hours for non-urgent messages</li>
                  <li>• Monitor delivery rates regularly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
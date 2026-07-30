// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\push-notifications\view\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  ArrowLeft,
  Bell,
  Calendar,
  Users,
  Route,
  Image as ImageIcon,
  Hash,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Copy,
  Info,
  Eye
} from "lucide-react";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { showSuccess } from "../../../../lib/swalHelper";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface PushNotification {
  id: number;
  platformId: number;
  name: string;
  schedulerId: number;
  conditionId: number;
  title: string;
  message: string;
  action: string | null;
  routeId: number;
  strchr: string | null;
  nImage: string | null;
  variables: string[] | null;
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

export default function ViewPushNotification() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [notification, setNotification] = useState<PushNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);
  

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/scheduled-campaigns/push-notifications/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load notification");

        const result = await res.json();
        setNotification(result.data);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNotification();
  }, [id, router, API_URL]);

  const formatDate = (date: string) => {
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
          <p className="text-gray-600 dark:text-gray-400">Loading notification details...</p>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Notification not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Push Notification Details"
        // description="View and manage scheduler configuration"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Push Notifications", href: "/admin/dashboard/scheduled-campaigns/push-notification" },
          { label: "View" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/push-notification",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
            // No permission required for Back button
          },
          {
            href: `/admin/dashboard/scheduled-campaigns/push-notification/edit/${id}`,
            label: "Edit Push Notification",
            icon: <Edit className="h-4 w-4" />,
            variant: 'primary',
            permission: { 
              resource: "push-notification", 
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Notification Name</p>
                <div className="mt-1 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-purple-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.name}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {notification.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    notification.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}>
                    {notification.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduler ID</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{notification.schedulerId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Condition ID</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{notification.conditionId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Route ID</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{notification.routeId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(notification.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Notification Content
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Title</p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {notification.title}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Message</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>
              {notification.action && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Action</p>
                  <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                    {notification.action}
                  </p>
                </div>
              )}
              {notification.strchr && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deep Link / URL</p>
                  <div className="mt-1 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <a
                      href={notification.strchr}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline dark:text-purple-400"
                    >
                      {notification.strchr}
                    </a>
                    <button
                      onClick={() => copyToClipboard(notification.strchr!, "URL")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              {notification.nImage && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Image URL</p>
                  <div className="mt-1 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                    <a
                      href={notification.nImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline dark:text-purple-400"
                    >
                      {notification.nImage}
                    </a>
                    <button
                      onClick={() => setShowImagePreview(!showImagePreview)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(notification.nImage!, "Image URL")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  {showImagePreview && notification.nImage && (
                    <div className="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <img
                        src={notification.nImage}
                        alt="Notification preview"
                        className="max-h-48 rounded-lg object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Variables */}
          {notification.variables && notification.variables.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Variables
              </h3>
              <div className="flex flex-wrap gap-2">
                {notification.variables.map((variable, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    <Hash className="h-3 w-3" />
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <ul className="space-y-2 text-sm">
              <li>• Test this notification before sending</li>
              <li>• Use in push notification campaigns</li>
              <li>• Monitor delivery and open rates</li>
              <li>• Update content as needed</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Usage Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Linked to scheduler #{notification.schedulerId}</li>
              <li>• Uses condition #{notification.conditionId}</li>
              <li>• Route ID: {notification.routeId}</li>
              <li>• Supports {notification.variables?.length || 0} dynamic variables</li>
            </ul>
          </div>

          <div className="rounded-xl bg-green-50 p-6 dark:bg-green-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Notification Preview
                </h3>
                <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message.length > 80 
                      ? notification.message.substring(0, 80) + "..." 
                      : notification.message}
                  </p>
                  {notification.action && (
                    <p className="text-xs text-purple-600 mt-2">
                      Action: {notification.action}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-yellow-50 p-6 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Best Practices
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Keep title under 50 characters</li>
                  <li>• Keep message concise and actionable</li>
                  <li>• Use images under 1MB for best performance</li>
                  <li>• Test on both iOS and Android devices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
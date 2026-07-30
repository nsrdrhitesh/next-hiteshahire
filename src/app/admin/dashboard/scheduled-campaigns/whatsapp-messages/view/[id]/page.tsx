
// View Page - D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\whatsapp-messages\view\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  ArrowLeft,
  MessageSquare,
  Link as LinkIcon,
  Hash,
  Calendar,
  CheckCircle,
  XCircle,
  Copy,
  Info
} from "lucide-react";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { showSuccess } from "../../../../lib/swalHelper";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface WhatsAppMessage {
  id: number;
  platformId: number;
  name: string;
  templateUrl: string | null;
  variables: string[] | null;
  schedulerId: number;
  conditionId: number;
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

export default function ViewWhatsAppMessage() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [message, setMessage] = useState<WhatsAppMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);


  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/scheduled-campaigns/whatsapp-messages/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load message");

        const result = await res.json();
        setMessage(result);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMessage();
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
          <p className="text-gray-600 dark:text-gray-400">Loading message details...</p>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Message not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="WhatsApp Message Details"
        // description="View and manage scheduler configuration"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "WhatsApp Messages", href: "/admin/dashboard/scheduled-campaigns/whatsapp-messages" },
          { label: "View" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/whatsapp-messages",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
            // No permission required for Back button
          },
          {
            href: `/admin/dashboard/scheduled-campaigns/whatsapp-messages/edit/${id}`,
            label: "Edit WhatsApp Message",
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Message Name</p>
                <div className="mt-1 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {message.name}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {message.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      message.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {message.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduler ID</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{message.schedulerId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Condition ID</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{message.conditionId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(message.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Template URL */}
          {message.templateUrl && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Template URL
              </h3>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                <a
                  href={message.templateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:underline dark:text-purple-400"
                >
                  {message.templateUrl}
                </a>
                <button
                  onClick={() => copyToClipboard(message.templateUrl!, "Template URL")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Variables */}
          {message.variables && message.variables.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Variables
              </h3>
              <div className="flex flex-wrap gap-2">
                {message.variables.map((variable, idx) => (
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
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <ul className="space-y-2 text-sm">
              <li>• Use this template in campaigns</li>
              <li>• Test message before sending</li>
              <li>• Monitor delivery rates</li>
              <li>• Update variables as needed</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Usage Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Linked to scheduler #{message.schedulerId}</li>
              <li>• Uses condition #{message.conditionId}</li>
              <li>• Supports {message.variables?.length || 0} dynamic variables</li>
              <li>• WhatsApp Cloud API ready</li>
            </ul>
          </div>

          <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Template Guidelines
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Must be approved by WhatsApp</li>
                  <li>• Variables must match template</li>
                  <li>• Test thoroughly before activation</li>
                  <li>• Monitor for policy compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
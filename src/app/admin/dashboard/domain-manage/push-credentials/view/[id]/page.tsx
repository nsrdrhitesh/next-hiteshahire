"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  ArrowLeft,
  Bell,
  Database,
  Key,
  Globe,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Info
} from "lucide-react";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { showSuccess, showError } from "../../../../lib/swalHelper";

interface PushCredential {
  id: number;
  platformId: number;
  credentialName: string;
  firebaseProjectId: string;
  firebaseServerKey: string;
  firebaseAppId: string | null;
  vapidKey: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewPushCredential() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [credential, setCredential] = useState<PushCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showServerKey, setShowServerKey] = useState(false);
  const [showVapidKey, setShowVapidKey] = useState(false);

  useEffect(() => {
    const fetchCredential = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/platforms/push-credentials/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load credential");

        const result = await res.json();
        setCredential(result.data);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCredential();
  }, [id, router, API_URL]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await showSuccess(`${label} copied to clipboard`);
    } catch (err) {
      showError("Failed to copy");
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const maskKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 20) return "•".repeat(key.length);
    return key.substring(0, 10) + "•".repeat(10) + key.substring(key.length - 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading credential details...</p>
        </div>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Credential not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
              { label: "Push Credentials", href: "/admin/dashboard/domain-manage/push-credentials" },
              { label: "View" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Push Credential Details
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage Firebase Cloud Messaging credentials
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/domain-manage/push-credentials"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
          <Link
            href={`/admin/dashboard/domain-manage/push-credentials/edit/${id}`}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
          >
            <Edit className="h-4 w-4" />
            Edit Credential
          </Link>
        </div>
      </div>

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
                <p className="text-xs text-gray-500 dark:text-gray-400">Credential Name</p>
                <div className="mt-1 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {credential.credentialName}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {credential.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      credential.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {credential.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Firebase Project ID</p>
                <div className="mt-1 flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {credential.firebaseProjectId}
                  </p>
                  <button
                    onClick={() => copyToClipboard(credential.firebaseProjectId, "Project ID")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {credential.firebaseAppId && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Firebase App ID</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {credential.firebaseAppId}
                    </p>
                    <button
                      onClick={() => copyToClipboard(credential.firebaseAppId!, "App ID")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(credential.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(credential.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Firebase Server Key */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Firebase Server Key
            </h3>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                readOnly
                value={
                  showServerKey
                    ? credential.firebaseServerKey
                    : maskKey(credential.firebaseServerKey)
                }
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={() => setShowServerKey(!showServerKey)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showServerKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => copyToClipboard(credential.firebaseServerKey, "Server key")}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <Copy className="h-4 w-4" />
                Copy key
              </button>
            </div>
          </div>

          {/* VAPID Key */}
          {credential.vapidKey && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                VAPID Key (Web Push)
              </h3>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  readOnly
                  value={
                    showVapidKey
                      ? credential.vapidKey
                      : maskKey(credential.vapidKey)
                  }
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={() => setShowVapidKey(!showVapidKey)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showVapidKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(credential.vapidKey!, "VAPID key")}
                className="mt-2 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <Copy className="h-4 w-4" />
                Copy VAPID key
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <ul className="space-y-2 text-sm">
              <li>• Use this credential for push campaigns</li>
              <li>• Test notification before sending</li>
              <li>• Monitor delivery rates regularly</li>
              <li>• Rotate keys periodically for security</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Security Notes
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Server key is encrypted at rest</li>
              <li>• Never expose server key in client code</li>
              <li>• Use different keys for dev/production</li>
              <li>• Regenerate keys if compromised</li>
            </ul>
          </div>

          <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Firebase Configuration Tips
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Enable FCM API in Google Cloud Console</li>
                  <li>• Configure app certificates for iOS/Android</li>
                  <li>• Set up proper authentication methods</li>
                  <li>• Test with Firebase Console first</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
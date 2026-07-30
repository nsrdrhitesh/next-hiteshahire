"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  Bell, 
  Database, 
  Key, 
  Globe, 
  Shield,
  Info,
  AlertCircle
} from "lucide-react";
import { showSuccess, showError } from "../../lib/swalHelper";

interface PushCredentialFormProps {
  mode: "create" | "edit";
  initialData?: any;
  credentialId?: string;
}

export default function PushCredentialForm({
  mode,
  initialData,
  credentialId,
}: PushCredentialFormProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [showServerKey, setShowServerKey] = useState(false);
  const [showVapidKey, setShowVapidKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    platformId: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
    credentialName: "",
    firebaseProjectId: "",
    firebaseServerKey: "",
    firebaseAppId: "",
    vapidKey: "",
    isActive: 1,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        platformId: initialData.platformId,
        credentialName: initialData.credentialName,
        firebaseProjectId: initialData.firebaseProjectId,
        firebaseServerKey: initialData.firebaseServerKey,
        firebaseAppId: initialData.firebaseAppId || "",
        vapidKey: initialData.vapidKey || "",
        isActive: initialData.isActive,
      });
    }
  }, [mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked ? 1 : 0 : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.credentialName.trim()) {
      newErrors.credentialName = "Credential name is required";
    }
    if (!formData.firebaseProjectId.trim()) {
      newErrors.firebaseProjectId = "Firebase project ID is required";
    }
    if (!formData.firebaseServerKey.trim()) {
      newErrors.firebaseServerKey = "Firebase server key is required";
    } else if (formData.firebaseServerKey.length < 20) {
      newErrors.firebaseServerKey = "Server key seems too short. Please check if it's correct.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const url =
        mode === "create"
          ? `${API_URL}/platforms/push-credentials`
          : `${API_URL}/platforms/push-credentials/${credentialId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));

        if (errData.message && typeof errData.message === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errData.message).forEach(([field, msgs]) => {
            if (Array.isArray(msgs)) {
              fieldErrors[field] = msgs.join(", ");
            } else if (typeof msgs === "string") {
              fieldErrors[field] = msgs;
            }
          });
          setErrors(fieldErrors);
        } else {
          showError(errData.message || `${mode === "create" ? "Create" : "Update"} failed`);
        }
        setLoading(false);
        return;
      }

      await showSuccess(
        `Push credential ${mode === "create" ? "created" : "updated"} successfully`
      );
      router.push("/admin/dashboard/domain-manage/push-credentials");
      router.refresh();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      showError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Credential Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Bell className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="credentialName"
                    value={formData.credentialName}
                    onChange={handleChange}
                    placeholder="e.g., Firebase Production, Staging"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {errors.credentialName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.credentialName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Firebase Project ID <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firebaseProjectId"
                    value={formData.firebaseProjectId}
                    onChange={handleChange}
                    placeholder="matrimony-prod-12345"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Found in Firebase Console → Project Settings
                </p>
                {errors.firebaseProjectId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.firebaseProjectId}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Firebase App ID
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firebaseAppId"
                    value={formData.firebaseAppId}
                    onChange={handleChange}
                    placeholder="1:123456789012:android:abc123def456"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional: Required for some Firebase features
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  VAPID Key (Web Push)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="vapidKey"
                    value={formData.vapidKey}
                    onChange={handleChange}
                    rows={3}
                    placeholder="BMpLqRsTuVwXyZ0123456789abcdefghijklmnopqrstuvwxyz"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 font-mono text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVapidKey(!showVapidKey)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showVapidKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Required for web push notifications. Generate from Firebase Console
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive === 1}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked ? 1 : 0 }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Active
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Inactive credentials won't be used for sending push notifications
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Firebase Server Key
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Server Key (Legacy) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="firebaseServerKey"
                  value={formData.firebaseServerKey}
                  onChange={handleChange}
                  rows={6}
                  placeholder="AAAApYzX1sM:APA91bHjKxLmNpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 font-mono text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowServerKey(!showServerKey)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showServerKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.firebaseServerKey && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.firebaseServerKey}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This token will be encrypted automatically before storage. Get it from Firebase Console → Project Settings → Cloud Messaging
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  How to get Firebase credentials?
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>1. Go to Firebase Console → Your Project</li>
                  <li>2. Navigate to Project Settings → Cloud Messaging</li>
                  <li>3. Copy "Server Key" for legacy API</li>
                  <li>4. For web push, generate VAPID keys from the same page</li>
                  <li>5. Project ID is available in General settings</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-yellow-50 p-6 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Important Notes
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Keep server keys secure and never expose them client-side</li>
                  <li>• Use different credentials for development and production</li>
                  <li>• Server keys can be regenerated from Firebase Console</li>
                  <li>• Test credentials before using in production campaigns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/dashboard/domain-manage/push-credentials"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600 disabled:opacity-70"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Create Credential"
            : "Update Credential"}
        </button>
      </div>
    </form>
  );
}
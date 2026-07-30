// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\scheduled-campaigns\whatsapp\credentials\components\WhatsAppCredentialForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Key, Phone, MessageSquare, Globe, Shield } from "lucide-react";
import { showSuccess, showError } from "../../lib/swalHelper";

interface WhatsAppCredentialFormProps {
  mode: "create" | "edit";
  initialData?: any;
  credentialId?: string;
}

export default function WhatsAppCredentialForm({
  mode,
  initialData,
  credentialId,
}: WhatsAppCredentialFormProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    platformId: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
    credentialName: "",
    phoneNumber: "",
    phoneNumberId: "",
    whatsappBusinessAccountId: "",
    accessToken: "",
    templateNamespace: "",
    twoFactorSecret: "",
    isActive: 1,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        platformId: initialData.platformId,
        credentialName: initialData.credentialName,
        phoneNumber: initialData.phoneNumber,
        phoneNumberId: initialData.phoneNumberId,
        whatsappBusinessAccountId: initialData.whatsappBusinessAccountId,
        accessToken: initialData.accessToken,
        templateNamespace: initialData.templateNamespace || "",
        twoFactorSecret: initialData.twoFactorSecret || "",
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
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[0-9\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!formData.phoneNumberId.trim()) {
      newErrors.phoneNumberId = "Phone number ID is required";
    }
    if (!formData.whatsappBusinessAccountId.trim()) {
      newErrors.whatsappBusinessAccountId = "WhatsApp Business Account ID is required";
    }
    if (!formData.accessToken.trim()) {
      newErrors.accessToken = "Access token is required";
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
          ? `${API_URL}/platforms/whatsapp-credentials`
          : `${API_URL}/platforms/whatsapp-credentials/${credentialId}`;
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
        `WhatsApp credential ${mode === "create" ? "created" : "updated"} successfully`
      );
      router.push("/admin/dashboard/domain-manage/whatsapp-credentials");
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
                  <MessageSquare className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="credentialName"
                    value={formData.credentialName}
                    onChange={handleChange}
                    placeholder="e.g., Production WA Business, Backup Number"
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
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Phone Number ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="phoneNumberId"
                  value={formData.phoneNumberId}
                  onChange={handleChange}
                  placeholder="123456789012345"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.phoneNumberId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.phoneNumberId}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  WhatsApp Business Account ID <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="whatsappBusinessAccountId"
                    value={formData.whatsappBusinessAccountId}
                    onChange={handleChange}
                    placeholder="waba_123456789"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {errors.whatsappBusinessAccountId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.whatsappBusinessAccountId}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Additional Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Template Namespace
                </label>
                <input
                  type="text"
                  name="templateNamespace"
                  value={formData.templateNamespace}
                  onChange={handleChange}
                  placeholder="e.g., matrimony_india_prod"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional: Used for message templates
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Two-Factor Secret
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="twoFactorSecret"
                    value={formData.twoFactorSecret}
                    onChange={handleChange}
                    placeholder="Enter 2FA secret if required"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
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
                  Inactive credentials won't be used for sending messages
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Access Token
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Access Token <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="accessToken"
                  value={formData.accessToken}
                  onChange={handleChange}
                  rows={6}
                  placeholder="EAAJZBZCvZBZC0wBAAZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZBZCZCZBZCZBZCZBZCZBZCZBZCZBZCZBZC"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 font-mono text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.accessToken && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.accessToken}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This token will be encrypted automatically before storage
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              Important Notes
            </h3>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>• Phone number must be registered with WhatsApp Business API</li>
              <li>• Access token should have proper permissions for message sending</li>
              <li>• Template namespace is required for using message templates</li>
              <li>• Keep credentials secure and rotate tokens regularly</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/dashboard/domain-manage/whatsapp-credentials"
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
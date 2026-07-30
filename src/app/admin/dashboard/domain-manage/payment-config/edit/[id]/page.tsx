"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import { showSuccess, showError } from '../../../../lib/swalHelper';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface FormData {
  platformId: number | "";
  gatewayName: string;
  merchantId?: string;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  mode: number;    // 1 = Test, 2 = Live
  status: number;  // 1 = Active, 2 = Inactive
}

export default function EditDomainPaymentConfig() {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [formData, setFormData] = useState<FormData>({
    platformId: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
    gatewayName: "",
    mode: 1,
    status: 1,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedPlatformId = localStorage.getItem("selected_platform_id");

  // Fetch existing config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/domain/payment-config/${selectedPlatformId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load payment configuration");

        const result = await res.json();
        const data = result.data; // assuming your API returns { data: {...} }

        setFormData({
          platformId: data.platformId,
          gatewayName: data.gatewayName,
          merchantId: data.merchantId || "",
          publicKey: data.publicKey || "",
          secretKey: data.secretKey || "",
          webhookSecret: data.webhookSecret || "",
          mode: data.mode,
          status: data.status,
        });
      } catch (err: any) {
        setError(err.message || "Could not load configuration");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchConfig();
  }, [id, router, API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["mode", "status", "platformId"].includes(name) ? Number(value) : value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const res = await fetch(`${API_URL}/domain/payment-config/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        
        // Handle field validation errors from backend
        if (errData.message && typeof errData.message === 'object') {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errData.message).forEach(([field, msgs]) => {
            if (Array.isArray(msgs)) {
              fieldErrors[field] = msgs.join(', ');
            } else if (typeof msgs === 'string') {
              fieldErrors[field] = msgs;
            }
          });
          setErrors(fieldErrors);
        } else {
          // General error message
          setError(errData.message || 'Create failed');
        }
        setLoading(false);
        return;
      }
      await showSuccess("Branding record created successfully");
      router.push("/admin/dashboard/domain-manage/payment-config");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      // showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading payment configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Edit Payment Gateway"
        // description="Update payment gateway settings for this platform"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
          { label: "Payment Config", href: "/admin/dashboard/domain-manage/payment-config" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/domain-manage/payment-config",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: submitting ? "Saving..." : "Save Changes",
            type: "submit",
            form: "payment-form",
            variant: "primary",
            disabled: submitting,
          },
        ]}
      />

      {/* {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )} */}

      <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Main Settings */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Platform ID *
              </label>
              <input
                type="number"
                name="platformId"
                value={formData.platformId}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div> */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Gateway Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="gatewayName"
                value={formData.gatewayName}
                onChange={handleChange}
                placeholder="Razorpay, Stripe, PayPal..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                // required
              />
              {errors.gatewayName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gatewayName}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Merchant ID
              </label>
              <input
                type="text"
                name="merchantId"
                value={formData.merchantId || ""}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Mode <span className="text-red-400">*</span>
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                // required
              >
                <option value={1}>Test Mode</option>
                <option value={2}>Live Mode</option>
              </select>
              {errors.mode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mode}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                // required
              >
                <option value={1}>Active</option>
                <option value={2}>Inactive</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Credentials</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Public Key / Publishable Key
              </label>
              <input
                type="text"
                name="publicKey"
                value={formData.publicKey || ""}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Secret Key
              </label>
              <input
                type="password"
                name="secretKey"
                value={formData.secretKey || ""}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Webhook Secret
              </label>
              <input
                type="text"
                name="webhookSecret"
                value={formData.webhookSecret || ""}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
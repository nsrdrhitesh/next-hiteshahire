"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import { showSuccess, showError } from '../../../../lib/swalHelper';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface FormData {
  platform_id: number;
  account_url: string;
  icon_class?: string;
  display_order?: number;
  status?: number;
}

export default function EditDomainSocialAccount() {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [formData, setFormData] = useState<FormData>({
    platform_id: 0,
    account_url: "",
    icon_class: "",
    display_order: 0,
    status: 1,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedPlatformId = localStorage.getItem("selected_platform_id");

  // Fetch existing data
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/domain/social-accounts/${selectedPlatformId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load social account");

        const result = await res.json();
        const data = result.data; // assuming your API returns { data: {...} }

        setFormData({
          platform_id: data.platform_id,
          account_url: data.account_url,
          icon_class: data.icon_class || "",
          display_order: data.display_order,
          status: data.status,
        });
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAccount();
  }, [id, router, API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "platform_id" || name === "display_order" || name === "status"
        ? Number(value)
        : value,
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

      const res = await fetch(`${API_URL}/domain/social-accounts/${id}`, {
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
      router.push("/admin/dashboard/domain-manage/social-accounts");
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
          <p className="text-gray-600 dark:text-gray-400">Loading social account data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Edit Social Account"
        // description="Update social media link and settings"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
          { label: "Social Accounts", href: "/admin/dashboard/domain-manage/social-accounts" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/domain-manage/social-accounts",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: submitting ? "Saving..." : "Save Changes",
            type: "submit",
            form: "social-form",
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form id="social-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Platform ID *
                  </label>
                  <input
                    type="number"
                    name="platform_id"
                    value={formData.platform_id}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div> */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Active</option>
                    <option value={2}>Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Account URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    name="account_url"
                    value={formData.account_url}
                    onChange={handleChange}
                    placeholder="https://www.instagram.com/yourprofile"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    // required
                  />
                  {errors.account_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.account_url}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Icon Class
                  </label>
                  <input
                    type="text"
                    name="icon_class"
                    value={formData.icon_class || ""}
                    onChange={handleChange}
                    placeholder="fab fa-instagram"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Font Awesome class (e.g. fab fa-facebook-f, fab fa-twitter)
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order ?? ""}
                    onChange={handleChange}
                    min={0}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Update Settings
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Changes will apply immediately after saving. Make sure the URL is valid and the icon class is correct.
            </p>
            <div className="mt-6">
              <button
                type="submit"
                form="social-form"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600 disabled:opacity-70"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
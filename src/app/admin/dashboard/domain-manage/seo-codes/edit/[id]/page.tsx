"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import { showSuccess, showError } from '../../../../lib/swalHelper';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

const ACCOUNT_TYPES = [
  { value: 1, label: "Facebook Pixel" },
  { value: 2, label: "Google Tag Manager (GTM)" },
  { value: 3, label: "Google Analytics (GA4)" },
  { value: 4, label: "Snapchat Pixel" },
  { value: 5, label: "Microsoft Clarity" },
];

const POSITIONS = [
  { value: 1, label: "Inside <head>" },
  { value: 2, label: "Before </body>" },
  { value: 3, label: "Right after <body>" },
];

export default function EditDomainSeoCode() {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [formData, setFormData] = useState({
    platformId: 0,
    accountType: 1,
    accountCode: "",
    positionType: 1,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedPlatformId = localStorage.getItem("selected_platform_id");

  // Fetch existing data
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/domain/seo-codes/${selectedPlatformId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load tracking code");

        const result = await res.json();
        const data = result.data; // assuming your backend returns { data: {...} }

        setFormData({
          platformId: data.platformId,
          accountType: data.accountType,
          accountCode: data.accountCode,
          positionType: data.positionType,
        });
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCode();
  }, [id, router, API_URL]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "platformId" || name === "accountType" || name === "positionType"
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

      const res = await fetch(`${API_URL}/domain/seo-codes/${id}`, {
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
      router.push("/admin/dashboard/domain-manage/seo-codes");
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
          <p className="text-gray-600 dark:text-gray-400">Loading tracking code data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Edit Tracking / SEO Code"
        // description="Update pixel, tag manager or analytics code for this platform"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
          { label: "SEO Code", href: "/admin/dashboard/domain-manage/seo-codes" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/domain-manage/seo-codes",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: submitting ? "Saving..." : "Save Changes",
            type: "submit",
            form: "code-form",
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

      <form id="code-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left column - metadata */}
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Tracking Type <span className="text-red-400">*</span>
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                // required
              >
                {ACCOUNT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.accountType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.accountType}</p>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Position <span className="text-red-400">*</span>
              </label>
              <select
                name="positionType"
                value={formData.positionType}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                // required
              >
                {POSITIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.positionType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.positionType}</p>
              )}
            </div>
          </div>

          {/* Right column - code */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Code / Script Snippet <span className="text-red-400">*</span>
            </label>
            <textarea
              name="accountCode"
              value={formData.accountCode}
              onChange={handleChange}
              rows={14}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Paste your full tracking code here..."
              // required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Include complete &lt;script&gt; tags. Changes apply immediately after save.
            </p>
            {errors.site_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.site_name}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/dashboard/domain-manage/seo-codes"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600 disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Update Code"}
          </button>
        </div>
      </form>
    </div>
  );
}
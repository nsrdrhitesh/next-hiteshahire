"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import { showSuccess, showError } from '../../../lib/swalHelper';
import PageHeader from "../../../components/ui/PageHeader";

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

export default function CreateDomainSeoCode() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [formData, setFormData] = useState({
    platformId: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
    accountType: 1,
    accountCode: "",
    positionType: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "platformId" || name === "accountType" || name === "positionType" ? Number(value) : value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const res = await fetch(`${API_URL}/domain/seo-codes`, {
        method: "POST",
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
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Tracking / SEO Code"
        // description="Insert pixel, tag manager or analytics code for this platform"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
          { label: "SEO Code", href: "/admin/dashboard/domain-manage/seo-codes" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/domain-manage/seo-codes",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: loading ? "Saving..." : "Save Code",
            type: "submit",
            form: "code-form",
            variant: "primary",
            disabled: loading,
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
          {/* Left column */}
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

          {/* Right column – code editor area */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Code / Script Snippet <span className="text-red-400">*</span>
            </label>
            <textarea
              name="accountCode"
              value={formData.accountCode}
              onChange={handleChange}
              rows={12}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder={`<!-- Example: Facebook Pixel -->
                <script>
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                ...
                </script>`}
              // required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Paste the full tracking/pixel code here (including &lt;script&gt; tags)
            </p>
            {errors.accountCode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.accountCode}</p>
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
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600 disabled:opacity-70"
          >
            {loading ? "Saving..." : "Create Tracking Code"}
          </button>
        </div>
      </form>
    </div>
  );
}
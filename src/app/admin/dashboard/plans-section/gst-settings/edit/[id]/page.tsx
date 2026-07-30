"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../../../lib/swalHelper";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

export default function EditGstSettingPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const [formData, setFormData] = useState({
    platformId: Number(platformId),
    name: "",
    percentage: 18,
    stateIds: [] as number[],
    countryIds: [] as number[],
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const percentageOptions = [0, 5, 12, 18, 28];

  // Fetch GST setting data for edit mode
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/gst-settings/${id}?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch GST setting");
        }

        const result = await response.json();
        setFormData({
          platformId: result.data.platformId,
          name: result.data.name,
          percentage: result.data.percentage,
          stateIds: result.data.stateIds || [],
          countryIds: result.data.countryIds || [],
          isActive: result.data.isActive === 1,
        });
      } catch (err) {
        setError("Failed to load GST setting data");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchSetting();
    }
  }, [id, platformId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "percentage") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setErrors({ ...errors, name: "Name is required" });
      setIsLoading(false);
      return;
    }

    if (!formData.percentage && formData.percentage !== 0) {
      setErrors({ ...errors, percentage: "GST percentage is required" });
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/gst-settings/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));

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
          setError(errData.message || "Update failed");
        }
        setIsLoading(false);
        return;
      }

      await showSuccess("GST setting updated successfully");
      router.push("/admin/dashboard/plans-section/gst-settings");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to update GST setting");
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTaxAmount = (baseAmount: number = 1000) => {
    return (baseAmount * formData.percentage) / 100;
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading GST setting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Plans Section", href: "/admin/dashboard/plans-section" },
              { label: "GST Settings", href: "/admin/dashboard/plans-section/gst-settings" },
              { label: "Edit" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit GST Setting</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Update GST rate and regional settings</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/gst-settings"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="gst-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? "Updating..." : "Update GST Setting"}
          </button>
        </div>
      </div> */}
      <PageHeader
        title="Edit GST Setting"
        // description="Update GST rate and regional settings"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Section", href: "/admin/dashboard/plans-section" },
          { label: "GST Settings", href: "/admin/dashboard/plans-section/gst-settings" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/gst-settings",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: isLoading ? "Updating..." : "Update GST Setting",
            type: "submit",
            form: "gst-form",
            variant: "primary",
            disabled: isLoading,
          },
        ]}
      />

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="gst-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., Standard GST, Reduced Rate, Zero Rated"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            {/* GST Percentage */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                GST Percentage <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {percentageOptions.map((percent) => (
                  <label
                    key={percent}
                    className={`relative flex cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      formData.percentage === percent
                        ? "border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20"
                        : "border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="percentage"
                      value={percent}
                      checked={formData.percentage === percent}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center w-full">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{percent}%</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.percentage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.percentage}</p>}
            </div>

            {/* State IDs */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                State IDs (comma-separated)
              </label>
              <input
                type="text"
                value={formData.stateIds.join(", ")}
                onChange={(e) => {
                  const ids = e.target.value.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                  setFormData(prev => ({ ...prev, stateIds: ids }));
                }}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., 1, 2, 3"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Leave empty to apply to all states</p>
            </div>

            {/* Country IDs */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Country IDs (comma-separated)
              </label>
              <input
                type="text"
                value={formData.countryIds.join(", ")}
                onChange={(e) => {
                  const ids = e.target.value.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                  setFormData(prev => ({ ...prev, countryIds: ids }));
                }}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., 1, 2, 3"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Leave empty to apply to all countries</p>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">GST Setting Status</h3>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="sr-only"
                />
                <label
                  htmlFor="isActive"
                  className={`block h-6 w-12 overflow-hidden rounded-full cursor-pointer transition-colors ${
                    formData.isActive ? "bg-gradient-to-r from-purple-600 to-pink-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                      formData.isActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Tax Preview Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tax Calculation Preview</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Base Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">₹1,000.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">GST Rate:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{formData.percentage}%</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Tax Amount:</span>
                  <span className="text-purple-600 dark:text-purple-400">₹{calculateTaxAmount().toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span className="text-gray-900 dark:text-white">Total Amount:</span>
                <span className="text-purple-600 dark:text-purple-400">₹{(1000 + calculateTaxAmount()).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/dashboard/plans-section/gst-settings"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to GST Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
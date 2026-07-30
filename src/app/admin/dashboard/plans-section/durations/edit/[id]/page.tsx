"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../../../lib/swalHelper";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

export default function EditDurationPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const [formData, setFormData] = useState({
    platformId: Number(platformId),
    durationDays: 30,
    displayName: "1 Month",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const durationOptions = [
    { days: 7, displayName: "1 Week", sortOrder: 1 },
    { days: 14, displayName: "2 Weeks", sortOrder: 2 },
    { days: 30, displayName: "1 Month", sortOrder: 3 },
    { days: 60, displayName: "2 Months", sortOrder: 4 },
    { days: 90, displayName: "3 Months", sortOrder: 5 },
    { days: 180, displayName: "6 Months", sortOrder: 6 },
    { days: 365, displayName: "1 Year", sortOrder: 7 },
    { days: 730, displayName: "2 Years", sortOrder: 8 },
  ];

  const getDisplayNameFromDays = (days: number): string => {
    const option = durationOptions.find(opt => opt.days === days);
    return option ? option.displayName : `${days} Days`;
  };

  const getSortOrderFromDays = (days: number): number => {
    const option = durationOptions.find(opt => opt.days === days);
    return option ? option.sortOrder : 0;
  };

  // Fetch duration data for edit mode
  useEffect(() => {
    const fetchDuration = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/durations/${id}?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch duration");
        }

        const result = await response.json();
        setFormData({
          platformId: result.data.platformId,
          durationDays: result.data.durationDays,
          displayName: result.data.displayName,
          description: result.data.description || "",
          sortOrder: result.data.sortOrder || 0,
          isActive: result.data.isActive === 1,
        });
      } catch (err) {
        setError("Failed to load duration data");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchDuration();
    }
  }, [id, platformId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "durationDays") {
      const days = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        durationDays: days,
        displayName: getDisplayNameFromDays(days),
        sortOrder: getSortOrderFromDays(days),
      }));
    } else if (name === "sortOrder") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
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

    if (!formData.durationDays) {
      setErrors({ ...errors, durationDays: "Duration days is required" });
      setIsLoading(false);
      return;
    }

    if (formData.durationDays <= 0) {
      setErrors({ ...errors, durationDays: "Duration days must be greater than 0" });
      setIsLoading(false);
      return;
    }

    if (!formData.displayName.trim()) {
      setErrors({ ...errors, displayName: "Display name is required" });
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/durations/${id}`, {
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

      await showSuccess("Duration updated successfully");
      router.push("/admin/dashboard/plans-section/durations");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to update duration");
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDurationColor = (days: number) => {
    if (days === 7 || days === 14) return "from-green-500 to-emerald-500";
    if (days === 30 || days === 60) return "from-blue-500 to-indigo-500";
    if (days === 90 || days === 180) return "from-purple-500 to-pink-500";
    if (days === 365 || days === 730) return "from-orange-500 to-red-500";
    return "from-gray-500 to-gray-600";
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading duration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Edit Duration"
        description="Update duration details"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Section", href: "/admin/dashboard/plans-section" },
          { label: "Durations", href: "/admin/dashboard/plans-section/durations" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/durations",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: isLoading ? "Updating..." : "Update Duration",
            type: "submit",
            form: "duration-form",
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
          <form id="duration-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Duration Selection */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Duration Period (Days) <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {durationOptions.map((option) => (
                  <label
                    key={option.days}
                    className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      formData.durationDays === option.days
                        ? "border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20"
                        : "border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="durationDays"
                      value={option.days}
                      checked={formData.durationDays === option.days}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center w-full">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {option.displayName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.days} days
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Or Custom Duration (Days)
                </label>
                <input
                  type="number"
                  name="durationDays"
                  value={formData.durationDays}
                  onChange={handleChange}
                  min="1"
                  max="1095"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter custom days (e.g., 45)"
                />
              </div>
              {errors.durationDays && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.durationDays}</p>}
            </div>

            {/* Display Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., 1 Month, 3 Months, 1 Year"
              />
              {errors.displayName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.displayName}</p>}
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., Best for short-term commitments, Ideal for long-term savings..."
              />
            </div>

            {/* Sort Order */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                min="0"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="0"
              />
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Duration Preview</h3>
            <div className={`rounded-lg bg-gradient-to-r ${getDurationColor(formData.durationDays)} p-6 text-white`}>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{formData.displayName}</div>
                <div className="text-sm opacity-90 mb-2">{formData.durationDays} days</div>
                <div className="text-xs opacity-75">{formData.description || "No description provided"}</div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Duration Status</h3>
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

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/dashboard/plans-section/durations"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Durations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
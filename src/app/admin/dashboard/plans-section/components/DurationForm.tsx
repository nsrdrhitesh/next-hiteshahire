"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";

interface DurationFormData {
  duration_days: number;
  display_name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

interface DurationFormProps {
  mode: "create" | "edit";
  durationId?: string;
}

export default function DurationForm({ mode, durationId }: DurationFormProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();

  const [formData, setFormData] = useState<DurationFormData>({
    duration_days: 30,
    display_name: "1 Month",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
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

  // Helper function to get display name from days
  const getDisplayNameFromDays = (days: number): string => {
    const option = durationOptions.find(opt => opt.days === days);
    return option ? option.displayName : `${days} Days`;
  };

  // Helper function to get sort order from days
  const getSortOrderFromDays = (days: number): number => {
    const option = durationOptions.find(opt => opt.days === days);
    return option ? option.sortOrder : 0;
  };

  // Fetch duration data for edit mode
  useEffect(() => {
    if (mode === "edit" && durationId) {
      const fetchDuration = async () => {
        try {
          const accessToken = localStorage.getItem("access_token");
          if (!accessToken) {
            router.push("/login");
            return;
          }

          const response = await fetch(`${API_URL}/durations/${durationId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch duration");
          }

          const result = await response.json();
          setFormData({
            duration_days: result.data.duration_days,
            display_name: result.data.display_name,
            description: result.data.description || "",
            sort_order: result.data.sort_order || 0,
            is_active: result.data.is_active === 1,
          });
        } catch (err) {
          setError("Failed to load duration data");
        } finally {
          setIsFetching(false);
        }
      };

      fetchDuration();
    }
  }, [mode, durationId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "duration_days") {
      const days = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        duration_days: days,
        display_name: getDisplayNameFromDays(days),
        sort_order: getSortOrderFromDays(days),
      }));
    } else if (name === "sort_order") {
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

    // Validation
    if (!formData.duration_days) {
      setErrors({ ...errors, duration_days: "Duration days is required" });
      setIsLoading(false);
      return;
    }

    if (formData.duration_days <= 0) {
      setErrors({ ...errors, duration_days: "Duration days must be greater than 0" });
      setIsLoading(false);
      return;
    }

    if (!formData.display_name.trim()) {
      setErrors({ ...errors, display_name: "Display name is required" });
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const url = mode === "create" ? `${API_URL}/durations` : `${API_URL}/durations/${durationId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          is_active: formData.is_active ? 1 : 0,
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
          setError(errData.message || `${mode === "create" ? "Create" : "Update"} failed`);
        }
        setIsLoading(false);
        return;
      }

      await showSuccess(
        mode === "create"
          ? "Duration created successfully"
          : "Duration updated successfully"
      );

      router.push("/admin/dashboard/plans-section/durations");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} duration`);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDurationDisplay = (days: number) => {
    if (days === 7) return "1 Week";
    if (days === 14) return "2 Weeks";
    if (days === 30) return "1 Month";
    if (days === 60) return "2 Months";
    if (days === 90) return "3 Months";
    if (days === 180) return "6 Months";
    if (days === 365) return "1 Year";
    if (days === 730) return "2 Years";
    return `${days} Days`;
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Plans Section", href: "/admin/dashboard/plans-section" },
              { label: "Durations", href: "/admin/dashboard/plans-section/durations" },
              { label: mode === "create" ? "Create" : "Edit" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create New Duration" : "Edit Duration"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {mode === "create"
              ? "Add a new plan duration in days (e.g., 30 days, 90 days, 365 days)"
              : "Update duration details"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/durations"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="duration-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-lg disabled:opacity-70"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Duration"
              : "Update Duration"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
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
                      formData.duration_days === option.days
                        ? "border-purple-600 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20"
                        : "border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration_days"
                      value={option.days}
                      checked={formData.duration_days === option.days}
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
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleChange}
                  min="1"
                  max="1095"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter custom days (e.g., 45)"
                />
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Select a preset duration or enter custom days (max 1095 days / 3 years)
              </p>
              {errors.duration_days && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration_days}</p>
              )}
            </div>

            {/* Display Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 1 Month, 3 Months, 1 Year"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                User-friendly name for this duration (auto-generated from days selection)
              </p>
              {errors.display_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.display_name}</p>
              )}
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Best for short-term commitments, Ideal for long-term savings..."
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Provide a description for this duration period (optional)
              </p>
            </div>

            {/* Sort Order */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Sort Order
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                min="0"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Lower numbers appear first in listings
              </p>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Duration Preview
            </h3>
            <div className={`rounded-lg bg-gradient-to-r ${getDurationColor(formData.duration_days)} p-6 text-white`}>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {formData.display_name}
                </div>
                <div className="text-sm opacity-90 mb-2">
                  {formData.duration_days} days
                </div>
                <div className="text-xs opacity-75">
                  {formData.description || "No description provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Duration Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Status
                  </label>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="is_active"
                      className={`block h-6 w-12 overflow-hidden rounded-full cursor-pointer transition-colors ${
                        formData.is_active
                          ? "bg-gradient-to-r from-purple-600 to-pink-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                          formData.is_active ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {formData.is_active
                    ? "Duration is active and available for plans"
                    : "Duration is inactive and won't be available"}
                </p>
              </div>
            </div>
          </div>

          {/* Duration Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Duration Information
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      About Durations (Days)
                    </h4>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>Durations define subscription periods in days:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Short-term:</strong> 7-30 days (1 week to 1 month)</li>
                        <li><strong>Medium-term:</strong> 60-180 days (2-6 months)</li>
                        <li><strong>Long-term:</strong> 365-730 days (1-2 years)</li>
                        <li>Used in plan pricing and offer eligibility</li>
                        <li>Auto-calculates discounts based on duration length</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    duration_days: 30,
                    display_name: "1 Month",
                    description: "",
                    sort_order: 0,
                    is_active: true,
                  });
                }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Form
              </button>
              <Link
                href="/admin/dashboard/plans-section/durations"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
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
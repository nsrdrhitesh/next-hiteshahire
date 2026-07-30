"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";

interface GSTSettingFormData {
  name: string;
  percentage: string;
  state_ids: string;
  country_ids: string;
  is_active: boolean;
}

interface GSTSettingFormProps {
  mode: "create" | "edit";
  settingId?: string;
}

// Sample state and country data - in production, this would come from an API
const stateOptions = [
  { code: "MH", name: "Maharashtra" },
  { code: "DL", name: "Delhi" },
  { code: "KA", name: "Karnataka" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "GJ", name: "Gujarat" },
  { code: "WB", name: "West Bengal" },
  { code: "RJ", name: "Rajasthan" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "TS", name: "Telangana" },
];

const countryOptions = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "UAE" },
  { code: "SG", name: "Singapore" },
];

export default function GSTSettingForm({ mode, settingId }: GSTSettingFormProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();

  const [formData, setFormData] = useState<GSTSettingFormData>({
    name: "",
    percentage: "",
    state_ids: "",
    country_ids: "",
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const percentageOptions = ["0", "5", "12", "18", "28"];

  // Fetch GST setting data for edit mode
  useEffect(() => {
    if (mode === "edit" && settingId) {
      const fetchSetting = async () => {
        try {
          const accessToken = localStorage.getItem("access_token");
          if (!accessToken) {
            router.push("/login");
            return;
          }

          const response = await fetch(`${API_URL}/gst-settings/${settingId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch GST setting");
          }

          const result = await response.json();
          setFormData({
            name: result.data.name,
            percentage: result.data.percentage,
            state_ids: result.data.state_ids || "",
            country_ids: result.data.country_ids || "",
            is_active: result.data.is_active === 1,
          });
        } catch (err) {
          setError("Failed to load GST setting data");
        } finally {
          setIsFetching(false);
        }
      };

      fetchSetting();
    }
  }, [mode, settingId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
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
    if (!formData.name.trim()) {
      setErrors({ ...errors, name: "Name is required" });
      setIsLoading(false);
      return;
    }

    if (!formData.percentage) {
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

      const url = mode === "create" ? `${API_URL}/gst-settings` : `${API_URL}/gst-settings/${settingId}`;
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
          ? "GST setting created successfully"
          : "GST setting updated successfully"
      );

      router.push("/admin/dashboard/plans-section/gst-settings");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} GST setting`);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTaxAmount = (baseAmount: number = 1000) => {
    const percentage = parseFloat(formData.percentage);
    if (isNaN(percentage)) return 0;
    return (baseAmount * percentage) / 100;
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Plans Section", href: "/admin/dashboard/plans-section" },
              { label: "GST Settings", href: "/admin/dashboard/plans-section/gst-settings" },
              { label: mode === "create" ? "Create" : "Edit" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create New GST Setting" : "Edit GST Setting"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {mode === "create"
              ? "Add a new GST rate configuration for specific regions"
              : "Update GST rate and regional settings"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/gst-settings"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="gst-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-lg disabled:opacity-70"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create GST Setting"
              : "Update GST Setting"}
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
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Standard GST, Reduced Rate, Zero Rated"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter a descriptive name for this GST configuration
              </p>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
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
                        ? "border-purple-600 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20"
                        : "border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-600"
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
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {percent}%
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Select the GST percentage rate
              </p>
              {errors.percentage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.percentage}</p>
              )}
            </div>

            {/* State IDs */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                State IDs (comma-separated)
              </label>
              <input
                type="text"
                name="state_ids"
                value={formData.state_ids}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., MH, DL, KA"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {stateOptions.map((state) => (
                  <button
                    key={state.code}
                    type="button"
                    onClick={() => {
                      const currentStates = formData.state_ids.split(",").map(s => s.trim()).filter(s => s);
                      if (currentStates.includes(state.code)) {
                        setFormData({
                          ...formData,
                          state_ids: currentStates.filter(s => s !== state.code).join(", ")
                        });
                      } else {
                        setFormData({
                          ...formData,
                          state_ids: [...currentStates, state.code].join(", ")
                        });
                      }
                    }}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-purple-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-purple-900/50"
                  >
                    {state.name} ({state.code})
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Leave empty to apply to all states
              </p>
            </div>

            {/* Country IDs */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Country IDs (comma-separated)
              </label>
              <input
                type="text"
                name="country_ids"
                value={formData.country_ids}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., IN, US, UK"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {countryOptions.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      const currentCountries = formData.country_ids.split(",").map(c => c.trim()).filter(c => c);
                      if (currentCountries.includes(country.code)) {
                        setFormData({
                          ...formData,
                          country_ids: currentCountries.filter(c => c !== country.code).join(", ")
                        });
                      } else {
                        setFormData({
                          ...formData,
                          country_ids: [...currentCountries, country.code].join(", ")
                        });
                      }
                    }}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-purple-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-purple-900/50"
                  >
                    {country.name} ({country.code})
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Leave empty to apply to all countries
              </p>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              GST Setting Status
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
                    ? "GST setting is active and will be applied"
                    : "GST setting is inactive and won't be applied"}
                </p>
              </div>
            </div>
          </div>

          {/* Tax Preview Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Tax Calculation Preview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Base Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">₹1,000.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">GST Rate:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formData.percentage || "0"}%
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Tax Amount:</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    ₹{calculateTaxAmount().toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span className="text-gray-900 dark:text-white">Total Amount:</span>
                <span className="text-purple-600 dark:text-purple-400">
                  ₹{(1000 + calculateTaxAmount()).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              GST Information
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
                      About GST Settings
                    </h4>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>GST settings define tax rates for:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Specific states or regions</li>
                        <li>Different countries</li>
                        <li>Multiple tax slabs (0%, 5%, 12%, 18%, 28%)</li>
                        <li>Regional tax compliance</li>
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
                    name: "",
                    percentage: "",
                    state_ids: "",
                    country_ids: "",
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
                href="/admin/dashboard/plans-section/gst-settings"
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
                Back to GST Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
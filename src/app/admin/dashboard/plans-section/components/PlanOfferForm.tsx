"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";

interface PlanOfferFormData {
  platform_id: number;
  plan_id: number;
  name: string;
  description: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  applicable_duration_months: number[];
  applicable_device_codes: string[];
  start_date: string;
  end_date: string;
  conflict_handle_discount: "highest" | "lowest" | "newest" | "oldest" | "stack";
  is_active: boolean;
}

interface Plan {
  id: number;
  name: string;
  slug: string;
}

interface Platform {
  id: number;
  name: string;
  code: string;
}

interface DeviceType {
  id: number;
  device_code: string;
  device_name: string;
}

interface PlanOfferFormProps {
  mode: "create" | "edit";
  offerId?: string;
}

export default function PlanOfferForm({ mode, offerId }: PlanOfferFormProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();

  const [formData, setFormData] = useState<PlanOfferFormData>({
    platform_id: 0,
    plan_id: 0,
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    applicable_duration_months: [],
    applicable_device_codes: [],
    start_date: "",
    end_date: "",
    conflict_handle_discount: "highest",
    is_active: true,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const durationOptions = [1, 3, 6, 12, 24];
  
  const conflictOptions = [
    { value: "highest", label: "Highest Discount", description: "Apply the offer with the highest discount value" },
    { value: "lowest", label: "Lowest Discount", description: "Apply the offer with the lowest discount value" },
    { value: "newest", label: "Newest Offer", description: "Apply the most recently created offer" },
    { value: "oldest", label: "Oldest Offer", description: "Apply the oldest offer first" },
    { value: "stack", label: "Stack Offers", description: "Combine/stack multiple offers together" },
  ];

  // Fetch plans, platforms, and device types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const [plansRes, platformsRes, devicesRes] = await Promise.all([
          fetch(`${API_URL}/plans?limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/platforms?limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/device-types`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData.data.data);
        }

        if (platformsRes.ok) {
          const platformsData = await platformsRes.json();
          setPlatforms(platformsData.data.data);
        }

        if (devicesRes.ok) {
          const devicesData = await devicesRes.json();
          setDeviceTypes(devicesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch offer data for edit mode
  useEffect(() => {
    if (mode === "edit" && offerId) {
      const fetchOffer = async () => {
        try {
          const accessToken = localStorage.getItem("access_token");
          if (!accessToken) {
            router.push("/login");
            return;
          }

          const response = await fetch(`${API_URL}/plan-offers/${offerId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch offer");
          }

          const result = await response.json();
          setFormData({
            platform_id: result.data.platform_id || 0,
            plan_id: result.data.plan_id,
            name: result.data.name,
            description: result.data.description || "",
            discount_type: result.data.discount_type,
            discount_value: result.data.discount_value,
            applicable_duration_months: result.data.applicable_duration_months || [],
            applicable_device_codes: result.data.applicable_device_codes || [],
            start_date: result.data.start_date ? result.data.start_date.split("T")[0] : "",
            end_date: result.data.end_date ? result.data.end_date.split("T")[0] : "",
            conflict_handle_discount: result.data.conflict_handle_discount || "highest",
            is_active: result.data.is_active === 1,
          });
        } catch (err) {
          setError("Failed to load offer data");
        } finally {
          setIsFetching(false);
        }
      };

      fetchOffer();
    }
  }, [mode, offerId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "discount_value") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === "platform_id" || name === "plan_id") {
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

  const handleDurationChange = (duration: number) => {
    setFormData((prev) => {
      const currentDurations = [...prev.applicable_duration_months];
      if (currentDurations.includes(duration)) {
        return {
          ...prev,
          applicable_duration_months: currentDurations.filter((d) => d !== duration),
        };
      } else {
        return {
          ...prev,
          applicable_duration_months: [...currentDurations, duration].sort((a, b) => a - b),
        };
      }
    });
  };

  const handleDeviceChange = (deviceCode: string) => {
    setFormData((prev) => {
      const currentDevices = [...prev.applicable_device_codes];
      if (currentDevices.includes(deviceCode)) {
        return {
          ...prev,
          applicable_device_codes: currentDevices.filter((d) => d !== deviceCode),
        };
      } else {
        return {
          ...prev,
          applicable_device_codes: [...currentDevices, deviceCode],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setErrors({ ...errors, name: "Offer name is required" });
      setIsLoading(false);
      return;
    }

    if (!formData.plan_id) {
      setErrors({ ...errors, plan_id: "Please select a plan" });
      setIsLoading(false);
      return;
    }

    if (formData.discount_value <= 0) {
      setErrors({ ...errors, discount_value: "Discount value must be greater than 0" });
      setIsLoading(false);
      return;
    }

    if (formData.applicable_duration_months.length === 0) {
      setErrors({ ...errors, applicable_duration_months: "Please select at least one duration" });
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const url = mode === "create" ? `${API_URL}/plan-offers` : `${API_URL}/plan-offers/${offerId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const submitData = {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
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
          ? "Plan offer created successfully"
          : "Plan offer updated successfully"
      );

      router.push("/admin/dashboard/plans-section/plan-offers");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} offer`);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading offer data...</p>
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
              { label: "Plan Offers", href: "/admin/dashboard/plans-section/plan-offers" },
              { label: mode === "create" ? "Create" : "Edit" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create New Plan Offer" : "Edit Plan Offer"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {mode === "create"
              ? "Create a new discount or promotional offer for subscription plans"
              : "Update offer details and configurations"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/plan-offers"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="offer-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-lg disabled:opacity-70"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Offer"
              : "Update Offer"}
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
          <form id="offer-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Platform Selection */}
            {platforms.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Select Platform
                </label>
                <select
                  name="platform_id"
                  value={formData.platform_id}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value={0}>All Platforms</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name} ({platform.code})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Leave empty to apply to all platforms
                </p>
              </div>
            )}

            {/* Plan Selection */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Select Plan <span className="text-red-400">*</span>
              </label>
              <select
                name="plan_id"
                value={formData.plan_id}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value={0}>Select a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
              {errors.plan_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.plan_id}</p>
              )}
            </div>

            {/* Offer Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Offer Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., New Year Special, Festive Discount"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
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
                placeholder="Describe the offer details, terms, and conditions..."
              />
            </div>

            {/* Discount Configuration */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Discount Configuration
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Discount Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Discount Value <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    {formData.discount_type === "percentage" ? (
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500">%</span>
                      </div>
                    ) : (
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500">₹</span>
                      </div>
                    )}
                    <input
                      type="number"
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                        formData.discount_type === "percentage" ? "pr-8" : "pl-8"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {errors.discount_value && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.discount_value}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Applicable Durations */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Applicable Durations <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {durationOptions.map((duration) => (
                  <label key={duration} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.applicable_duration_months.includes(duration)}
                      onChange={() => handleDurationChange(duration)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {duration} {duration === 1 ? "Month" : "Months"}
                    </span>
                  </label>
                ))}
              </div>
              {errors.applicable_duration_months && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.applicable_duration_months}
                </p>
              )}
            </div>

            {/* Device Types */}
            {deviceTypes.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Device Types (Optional)
                </label>
                <div className="space-y-2">
                  {deviceTypes.map((device) => (
                    <label key={device.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.applicable_device_codes.includes(device.device_code)}
                        onChange={() => handleDeviceChange(device.device_code)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {device.device_name} ({device.device_code})
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Leave empty to apply to all device types
                </p>
              </div>
            )}

            {/* Validity Period */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Validity Period
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Offer Settings
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
              </div>
            </div>
          </div>

          {/* Conflict Handling Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Conflict Handling
            </h3>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                When multiple offers apply
              </label>
              <div className="space-y-2">
                {conflictOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      formData.conflict_handle_discount === option.value
                        ? "border-purple-600 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20"
                        : "border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="conflict_handle_discount"
                      value={option.value}
                      checked={formData.conflict_handle_discount === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Determines how to handle situations where multiple offers are eligible for the same user
              </p>
            </div>
          </div>

          {/* Information Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Offer Information
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
                      About Conflict Handling
                    </h4>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>When a user qualifies for multiple offers:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Highest:</strong> Best discount for user</li>
                        <li><strong>Lowest:</strong> Minimum discount</li>
                        <li><strong>Newest/Oldest:</strong> Time-based priority</li>
                        <li><strong>Stack:</strong> Combine multiple offers</li>
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
                    platform_id: 0,
                    plan_id: 0,
                    name: "",
                    description: "",
                    discount_type: "percentage",
                    discount_value: 0,
                    applicable_duration_months: [],
                    applicable_device_codes: [],
                    start_date: "",
                    end_date: "",
                    conflict_handle_discount: "highest",
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
                href="/admin/dashboard/plans-section/plan-offers"
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
                Back to Offers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
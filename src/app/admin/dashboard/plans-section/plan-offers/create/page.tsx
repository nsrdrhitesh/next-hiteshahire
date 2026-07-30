"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../../lib/swalHelper";
import { Breadcrumb } from "../../../components/ui/breadcrumb";
import FormField from "../../../components/ui/fields/InputField";
import PageHeader from "../../../components/ui/PageHeader";
import { ArrowLeft } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  slug: string;
}

interface Duration {
  id: number;
  durationDays: number;
  displayName: string;
}

interface DeviceType {
  id: number;
  deviceCode: string;
  deviceName: string;
}

export default function CreatePlanOfferPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const [formData, setFormData] = useState({
    platformId: Number(platformId),
    planId: 0,
    name: "",
    description: "",
    discountType: 1,
    discountValue: 0,
    applicableDurationIds: [] as number[],
    applicableDeviceCodes: [] as number[],
    startDate: "",
    endDate: "",
    conflictHandleDiscount: 1,
    isActive: true,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const conflictOptions = [
    { value: 1, label: "Highest Discount", description: "Apply the offer with the highest discount value" },
    { value: 2, label: "Lowest Discount", description: "Apply the offer with the lowest discount value" },
    { value: 3, label: "Newest Offer", description: "Apply the most recently created offer" },
    { value: 4, label: "Oldest Offer", description: "Apply the oldest offer first" },
    { value: 5, label: "Stack Offers", description: "Combine/stack multiple offers together" },
  ];

  // Fetch plans, durations, and device types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const [plansRes, durationsRes, devicesRes] = await Promise.all([
          fetch(`${API_URL}/plans?platformId=${platformId}&limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/durations?platformId=${platformId}&isActive=true`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/device-types?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData.data.data);
        }

        if (durationsRes.ok) {
          const durationsData = await durationsRes.json();
          setDurations(durationsData.data.data);
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
  }, [platformId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "discountValue") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === "planId" || name === "discountType" || name === "conflictHandleDiscount") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleDurationChange = (durationId: number) => {
    setFormData((prev) => {
      const current = [...prev.applicableDurationIds];
      if (current.includes(durationId)) {
        return { ...prev, applicableDurationIds: current.filter((id) => id !== durationId) };
      } else {
        return { ...prev, applicableDurationIds: [...current, durationId] };
      }
    });
  };

  const handleDeviceChange = (deviceId: number) => {
    setFormData((prev) => {
      const current = [...prev.applicableDeviceCodes];
      if (current.includes(deviceId)) {
        return { ...prev, applicableDeviceCodes: current.filter((id) => id !== deviceId) };
      } else {
        return { ...prev, applicableDeviceCodes: [...current, deviceId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setErrors({ ...errors, name: "Offer name is required" });
      setIsLoading(false);
      return;
    }

    if (!formData.planId) {
      setErrors({ ...errors, planId: "Please select a plan" });
      setIsLoading(false);
      return;
    }

    if (formData.discountValue <= 0) {
      setErrors({ ...errors, discountValue: "Discount value must be greater than 0" });
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/plan-offers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isActive: formData.isActive ? 1 : 0,
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
          setError(errData.message || "Create failed");
        }
        setIsLoading(false);
        return;
      }

      await showSuccess("Plan offer created successfully");
      router.push("/admin/dashboard/plans-section/plan-offers");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to create offer");
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDiscount = () => {
    if (formData.discountType === 1) {
      return `${formData.discountValue}% OFF`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(formData.discountValue);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Create Plan Offer"
        // description="Configure scheduling rules for automated campaigns"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Section", href: "/admin/dashboard/plans-section" },
          { label: "Plan Offers", href: "/admin/dashboard/plans-section/plan-offers" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/plan-offers",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
          {
            label: isLoading ? "Creating..." : "Create Offer",
            type: "submit",
            form: "offer-form",
            variant: "primary",
            disabled: isLoading,
          },
        ]}
      />
          {/* <button
            type="submit"
            form="offer-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? "Creating..." : "Create Offer"}
          </button> */}

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="offer-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Selection */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Select Plan <span className="text-red-400">*</span>
              </label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value={0}>Select a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
              {errors.planId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.planId}</p>}
            </div>

            {/* Offer Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <FormField
                label="Offer Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., New Year Special"
                required
                error={errors.name}
              />
              {/* <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Offer Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., New Year Special, Festive Discount"
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>} */}
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
                placeholder="Describe the offer details, terms, and conditions..."
              />
            </div>

            {/* Discount Configuration */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Discount Configuration</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Discount Type</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Percentage (%)</option>
                    <option value={2}>Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Discount Value</label>
                  <div className="relative">
                    {formData.discountType === 1 ? (
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 dark:text-gray-400">%</span>
                      </div>
                    ) : (
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 dark:text-gray-400">₹</span>
                      </div>
                    )}
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                        formData.discountType === 1 ? "pr-8" : "pl-8"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {errors.discountValue && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.discountValue}</p>}
                </div>
              </div>
            </div>

            {/* Applicable Durations */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Applicable Durations <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {durations.map((duration) => (
                  <label key={duration.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.applicableDurationIds.includes(duration.id)}
                      onChange={() => handleDurationChange(duration.id)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{duration.displayName} ({duration.durationDays} days)</span>
                  </label>
                ))}
              </div>
              {errors.applicableDurationIds && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.applicableDurationIds}</p>}
            </div>

            {/* Device Types */}
            {deviceTypes.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Device Types (Optional)</label>
                <div className="space-y-2">
                  {deviceTypes.map((device) => (
                    <label key={device.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.applicableDeviceCodes.includes(device.id)}
                        onChange={() => handleDeviceChange(device.id)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{device.deviceName} ({device.deviceCode})</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Leave empty to apply to all device types</p>
              </div>
            )}

            {/* Validity Period */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Validity Period</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
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
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Offer Settings</h3>
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

          {/* Conflict Handling Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Conflict Handling</h3>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">When multiple offers apply</label>
              <div className="space-y-2">
                {conflictOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      formData.conflictHandleDiscount === option.value
                        ? "border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20"
                        : "border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="conflictHandleDiscount"
                      value={option.value}
                      checked={formData.conflictHandleDiscount === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Offer Preview</h3>
            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <div className="text-center">
                <div className="text-lg font-bold mb-1">{formData.name || "Offer Name"}</div>
                <div className="text-2xl font-bold">{formatDiscount()}</div>
                <div className="text-xs opacity-90 mt-2">
                  {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "No start date"} -{" "}
                  {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : "No end date"}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    platformId: Number(platformId),
                    planId: 0,
                    name: "",
                    description: "",
                    discountType: 1,
                    discountValue: 0,
                    applicableDurationIds: [],
                    applicableDeviceCodes: [],
                    startDate: "",
                    endDate: "",
                    conflictHandleDiscount: 1,
                    isActive: true,
                  });
                }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Form
              </button>
              <Link
                href="/admin/dashboard/plans-section/plan-offers"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
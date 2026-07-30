"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { ArrowLeft } from "lucide-react";

interface DeviceType {
  id: number;
  deviceCode: string;
  deviceName: string;
  isActive: number;
}

interface Duration {
  id: number;
  durationDays: number;
  displayName: string;
  isActive: number;
}

interface PlanFormData {
  platformId: number;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  sortOrder: number;
  deviceTypeIds: number[];
  durationIds: number[];
  isActive: boolean;
}

interface PlanFormProps {
  mode: "create" | "edit";
  planId?: string;
}

export default function PlanForm({ mode, planId }: PlanFormProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();

  const [formData, setFormData] = useState<PlanFormData>({
    platformId: Number(localStorage.getItem("selected_platform_id")) || 2,
    name: "",
    slug: "",
    description: "",
    monthlyPrice: 0,
    sortOrder: 0,
    deviceTypeIds: [],
    durationIds: [],
    isActive: true,
  });

  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const platformId = localStorage.getItem("selected_platform_id");

  // Fetch device types and durations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const [deviceRes, durationRes] = await Promise.all([
          fetch(`${API_URL}/device-types?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/durations?platformId=${platformId}&isActive=true`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (deviceRes.ok) {
          const deviceData = await deviceRes.json();
          setDeviceTypes(deviceData.data);
        }

        if (durationRes.ok) {
          const durationData = await durationRes.json();
          setDurations(durationData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [platformId]);

  // Fetch plan data for edit mode
  useEffect(() => {
    if (mode === "edit" && planId) {
      const fetchPlan = async () => {
        try {
          const accessToken = localStorage.getItem("access_token");
          if (!accessToken) {
            router.push("/login");
            return;
          }

          const response = await fetch(`${API_URL}/plans/${planId}?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch plan");
          }

          const result = await response.json();
          setFormData({
            platformId: result.data.platformId,
            name: result.data.name,
            slug: result.data.slug,
            description: result.data.description || "",
            monthlyPrice: result.data.monthlyPrice,
            sortOrder: result.data.sortOrder || 0,
            deviceTypeIds: result.data.deviceTypeIds || [],
            durationIds: result.data.durationIds || [],
            isActive: result.data.isActive === 1,
          });
        } catch (err) {
          setError("Failed to load plan data");
        } finally {
          setIsFetching(false);
        }
      };

      fetchPlan();
    }
  }, [mode, planId, platformId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "monthlyPrice") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
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

  const handleMultiSelect = (field: "deviceTypeIds" | "durationIds", value: number) => {
    setFormData((prev) => {
      const current = [...prev[field]];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((id) => id !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setErrors({ ...errors, name: "Plan name is required" });
      setIsLoading(false);
      return;
    }

    if (!formData.slug.trim()) {
      setErrors({ ...errors, slug: "Plan slug is required" });
      setIsLoading(false);
      return;
    }

    if (formData.monthlyPrice <= 0) {
      setErrors({ ...errors, monthlyPrice: "Monthly price must be greater than 0" });
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const url = mode === "create" ? `${API_URL}/plans` : `${API_URL}/plans/${planId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
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
          setError(errData.message || `${mode === "create" ? "Create" : "Update"} failed`);
        }
        setIsLoading(false);
        return;
      }

      await showSuccess(
        mode === "create" ? "Plan created successfully" : "Plan updated successfully"
      );

      router.push("/admin/dashboard/plans-section/plans");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} plan`);
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
          <p className="text-gray-600 dark:text-gray-400">Loading plan data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={mode === "create" ? "Create New Plan" : "Edit Plan"}
        // description={mode === "create" ? "Add a new subscription plan" : "Update plan details and configurations"}
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Section", href: "/admin/dashboard/plans-section" },
          { label: "Plans", href: "/admin/dashboard/plans-section/plans" },
          { label: mode === "create" ? "Create" : "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/plans",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
          {
            label: isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Plan"
              : "Update Plan",
            type: "submit",
            form: "plan-form",
            variant: "primary",
            disabled: isLoading,
          },
        ]}
      />

                {/* <button
            type="submit"
            form="plan-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-70"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Plan"
              : "Update Plan"}
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
          <form id="plan-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Plan Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Enter plan name (e.g., Basic, Premium, Gold)"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            {/* Plan Slug */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Plan Slug <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="basic-premium-gold"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Generate
                </button>
              </div>
              {errors.slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>}
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
                placeholder="Describe what this plan includes..."
              />
            </div>

            {/* Monthly Price */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Monthly Price <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 dark:text-gray-400">₹</span>
                </div>
                <input
                  type="number"
                  name="monthlyPrice"
                  value={formData.monthlyPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-8 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              {errors.monthlyPrice && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.monthlyPrice}</p>}
            </div>

            {/* Sort Order */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Device Types */}
            {deviceTypes.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Device Types</label>
                <div className="space-y-2">
                  {deviceTypes.map((device) => (
                    <label key={device.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.deviceTypeIds.includes(device.id)}
                        onChange={() => handleMultiSelect("deviceTypeIds", device.id)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{device.deviceName} ({device.deviceCode})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Durations */}
            {durations.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Durations</label>
                <div className="space-y-2">
                  {durations.map((duration) => (
                    <label key={duration.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.durationIds.includes(duration.id)}
                        onChange={() => handleMultiSelect("durationIds", duration.id)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{duration.displayName} ({duration.durationDays} days)</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Plan Status</h3>
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
                    formData.isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-500"
                      : "bg-gray-300 dark:bg-gray-600"
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
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    platformId: Number(localStorage.getItem("selected_platform_id")) || 2,
                    name: "",
                    slug: "",
                    description: "",
                    monthlyPrice: 0,
                    sortOrder: 0,
                    deviceTypeIds: [],
                    durationIds: [],
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
                href="/admin/dashboard/plans-section/plans"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import PageHeader from "../../components/ui/PageHeader";
import { ArrowLeft } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  slug: string;
}

interface PlanFeatureFormData {
  platformId: number;
  planId: number;
  name: string;
  description: string;
  units: string;
  status: number;
  sortOrder: number;
}

interface PlanFeatureFormProps {
  mode: "create" | "edit";
  featureId?: string;
}

export default function PlanFeatureForm({ mode, featureId }: PlanFeatureFormProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();

  const [formData, setFormData] = useState<PlanFeatureFormData>({
    platformId: Number(localStorage.getItem("selected_platform_id")) || 2,
    planId: 0,
    name: "",
    description: "",
    units: "",
    status: 1,
    sortOrder: 0,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const platformId = localStorage.getItem("selected_platform_id");

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const response = await fetch(`${API_URL}/plans?platformId=${platformId}&limit=100`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPlans(data.data.data);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };

    fetchPlans();
  }, [platformId]);

  // Fetch feature data for edit mode
  useEffect(() => {
    if (mode === "edit" && featureId) {
      const fetchFeature = async () => {
        try {
          const accessToken = localStorage.getItem("access_token");
          if (!accessToken) {
            router.push("/login");
            return;
          }

          const response = await fetch(`${API_URL}/plan-features/${featureId}?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch feature");
          }

          const result = await response.json();
          setFormData({
            platformId: result.data.platformId,
            planId: result.data.planId,
            name: result.data.name,
            description: result.data.description || "",
            units: result.data.units || "",
            status: result.data.status,
            sortOrder: result.data.sortOrder || 0,
          });
        } catch (err) {
          setError("Failed to load feature data");
        } finally {
          setIsFetching(false);
        }
      };

      fetchFeature();
    }
  }, [mode, featureId, platformId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "planId" || name === "status" || name === "sortOrder") {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setErrors({ ...errors, name: "Feature name is required" });
      setIsLoading(false);
      return;
    }

    if (!formData.planId) {
      setErrors({ ...errors, planId: "Please select a plan" });
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const url = mode === "create" ? `${API_URL}/plan-features` : `${API_URL}/plan-features/${featureId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
        mode === "create" ? "Plan feature created successfully" : "Plan feature updated successfully"
      );

      router.push("/admin/dashboard/plans-section/plan-features");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} feature`);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 1, label: "Active" },
    { value: 2, label: "Inactive" },
  ];

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading feature data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={mode === "create" ? "Create New Plan Feature" : "Edit Plan Feature"}
        // description={mode === "create" ? "Add a new feature to a subscription plan" : "Update feature details"}
        breadcrumbItems={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Plans Section", href: "/admin/dashboard/plans-section" },
            { label: "Plan Features", href: "/admin/dashboard/plans-section/plan-features" },
            { label: mode === "create" ? "Create" : "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/plan-features",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
          {
            label: isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Feature"
              : "Update Feature",
            type: "submit",
            form: "feature-form",
            variant: "primary",
            disabled: isLoading,
          },
        ]}
      />
                {/* <button
            type="submit"
            form="feature-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-70"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Feature"
              : "Update Feature"}
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
          <form id="feature-form" onSubmit={handleSubmit} className="space-y-6">
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
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
              {errors.planId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.planId}</p>}
            </div>

            {/* Feature Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Feature Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., Profile Views, Messaging, Photo Uploads"
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            {/* Units */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Units</label>
              <input
                type="text"
                name="units"
                value={formData.units}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., 100/month, Unlimited, 10/day"
              />
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Describe what this feature includes and any limitations..."
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
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Feature Status</h3>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                    planId: 0,
                    name: "",
                    description: "",
                    units: "",
                    status: 1,
                    sortOrder: 0,
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
                href="/admin/dashboard/plans-section/plan-features"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Features
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
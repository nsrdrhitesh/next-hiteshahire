"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { ArrowLeft, Edit } from "lucide-react";

interface PlanFeature {
  id: number;
  plan_id: number;
  plan_name?: string;
  name: string;
  description: string;
  units: string;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Plan {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function ViewPlanFeaturePage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [feature, setFeature] = useState<PlanFeature | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);

  const fetchFeature = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/plan-features/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch feature");
      }

      const result = await response.json();
      setFeature(result.data);

      // Fetch plan details
      if (result.data.plan_id) {
        const planResponse = await fetch(`${API_URL}/plans/${result.data.plan_id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (planResponse.ok) {
          const planResult = await planResponse.json();
          setPlan(planResult.data);
        }
      }
    } catch (err) {
      setError("Failed to load feature details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFeature();
  }, [id]);

  const getStatusBadge = (statusId: number) => {
    switch (statusId) {
      case 1:
        return (
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Active
          </span>
        );
      case 2:
        return (
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading feature details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Feature Details"
        // description="Complete overview of plan feature information"
        breadcrumbItems={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Plans Section", href: "/admin/dashboard/plans-section" },
            { label: "Plan Features", href: "/admin/dashboard/plans-section/plan-features" },
            { label: "Details" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/plan-features",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
          {
            href: `/admin/dashboard/plans-section/plan-features/edit/${id}`,
            label: "Edit Feature",
            icon: <Edit className="h-4 w-4" />,
            variant: 'primary',
            permission: { 
              resource: "plan-features", 
              action: "edit"   // or "edit"
            }
          }
        ]}
        permissions={permissions}
      />

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Feature Name */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Feature Name</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {feature?.name}
            </p>
          </div>

          {/* Associated Plan */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Associated Plan</p>
            <Link
              href={`/admin/dashboard/plans-section/plans/view/${plan?.id}`}
              className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-purple-600 hover:underline dark:text-purple-400"
            >
              {plan?.name || `Plan #${feature?.plan_id}`}
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
          </div>

          {/* Units */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Units</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {feature?.units || "No units specified"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-1">{feature && getStatusBadge(feature.status)}</div>
          </div>

          {/* Created At */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {feature?.created_at ? formatDate(feature.created_at) : "-"}
            </p>
          </div>

          {/* Updated At */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {feature?.updated_at ? formatDate(feature.updated_at) : "-"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

        {/* Description */}
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
          <div className="mt-3 rounded-xl bg-gray-50 p-4 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {feature?.description || "No description provided."}
          </div>
        </div>
      </div>

      {/* Extra Info Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Feature ID</h4>
          <p className="mt-2 text-xl font-bold">{feature?.id}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Plan ID</h4>
          <p className="mt-2 text-xl font-bold">{feature?.plan_id}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Current Status</h4>
          <p className="mt-2 text-lg font-semibold">
            {feature?.status === 1 ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </div>
  );
}
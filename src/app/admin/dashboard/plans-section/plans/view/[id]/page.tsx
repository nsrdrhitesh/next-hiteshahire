"use client";

import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { ArrowLeft, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: number;
  monthlyPrice: number;
  sortOrder: number;
  deviceTypeIds: number[];
  durationIds: number[];
  createdAt: string;
  updatedAt: string;
}

interface DeviceType {
  id: number;
  deviceCode: string;
  deviceName: string;
}

interface Duration {
  id: number;
  durationDays: number;
  displayName: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function ViewPlanPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const platformId = localStorage.getItem("selected_platform_id") || 2;
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);

  const fetchPlan = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const [planRes, deviceRes, durationRes] = await Promise.all([
        fetch(`${API_URL}/plans/${id}?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_URL}/device-types?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_URL}/durations?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      if (!planRes.ok) {
        throw new Error("Failed to fetch plan");
      }

      const planData = await planRes.json();
      setPlan(planData.data);

      if (deviceRes.ok) {
        const deviceData = await deviceRes.json();
        setDeviceTypes(deviceData.data);
      }

      if (durationRes.ok) {
        const durationData = await durationRes.json();
        setDurations(durationData.data.data);
      }
    } catch (err) {
      setError("Failed to load plan details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPlan();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceName = (deviceId: number) => {
    const device = deviceTypes.find(d => d.id === deviceId);
    return device ? `${device.deviceName} (${device.deviceCode})` : `Device ID: ${deviceId}`;
  };

  const getDurationName = (durationId: number) => {
    const duration = durations.find(d => d.id === durationId);
    return duration ? `${duration.displayName} (${duration.durationDays} days)` : `Duration ID: ${durationId}`;
  };

  const getStatusBadge = (isActive: number) => {
    return isActive === 1 ? (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-300">
        Active
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-300">
        Inactive
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
        <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Scheduler Details"
        // description="View and manage scheduler configuration"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Section", href: "/admin/dashboard/plans-section" },
          { label: "Plans", href: "/admin/dashboard/plans-section/plans" },
          { label: "View" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/plans",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
            // No permission required for Back button
          },
          {
            href: `/admin/dashboard/plans-section/plans/edit/${id}`,
            label: "Edit Plan",
            icon: <Edit className="h-4 w-4" />,
            variant: 'primary',
            permission: { 
              resource: "schedulers", 
              action: "edit"   // or "edit"
            }
          }
        ]}
        permissions={permissions}
      />

      {/* Hero Card */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-6xl mb-2">📋</div>
            <h2 className="text-3xl font-bold">{plan?.name}</h2>
            <p className="mt-2 text-white/80">{plan?.slug}</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Plan ID</div>
            <div className="text-2xl font-bold">#{plan?.id}</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Name</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{plan?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Slug</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{plan?.slug}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Price</p>
            <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{formatPrice(plan?.monthlyPrice || 0)}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">per month</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sort Order</p>
            <p className="mt-1 text-gray-900 dark:text-white">{plan?.sortOrder || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-1">{plan && getStatusBadge(plan.isActive)}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">{plan?.createdAt ? formatDate(plan.createdAt) : "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="mt-1 text-gray-900 dark:text-white">{plan?.updatedAt ? formatDate(plan.updatedAt) : "-"}</p>
          </div>
        </div>

        {/* Description */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
          <div className="mt-3 rounded-xl bg-gray-50 p-4 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
            {plan?.description || "No description provided."}
          </div>
        </div>

        {/* Device Types */}
        {plan?.deviceTypeIds && plan.deviceTypeIds.length > 0 && (
          <>
            <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Device Types</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.deviceTypeIds.map((deviceId) => (
                  <span
                    key={deviceId}
                    className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    {getDeviceName(deviceId)}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Durations */}
        {plan?.durationIds && plan.durationIds.length > 0 && (
          <>
            <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Durations</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.durationIds.map((durationId) => (
                  <span
                    key={durationId}
                    className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    {getDurationName(durationId)}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Extra Info Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Plan ID</h4>
          <p className="mt-2 text-xl font-bold">{plan?.id}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Monthly Subscription</h4>
          <p className="mt-2 text-xl font-bold">{formatPrice(plan?.monthlyPrice || 0)}</p>
          <p className="text-xs opacity-80">per month</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Sort Order</h4>
          <p className="mt-2 text-xl font-bold">{plan?.sortOrder || 0}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Current Status</h4>
          <p className="mt-2 text-lg font-semibold">{plan?.isActive === 1 ? "Active" : "Inactive"}</p>
        </div>
      </div>
    </div>
  );
}
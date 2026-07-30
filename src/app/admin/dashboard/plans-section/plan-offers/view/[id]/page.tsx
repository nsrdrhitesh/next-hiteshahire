"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { ArrowLeft, Edit } from "lucide-react";

interface PlanOffer {
  id: number;
  platformId: number;
  planId: number;
  planName?: string;
  name: string;
  description: string;
  discountType: number;
  discountValue: number;
  applicableDurationIds: number[];
  applicableDeviceCodes: number[] | null;
  startDate: string | null;
  endDate: string | null;
  conflictHandleDiscount: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: number;
  name: string;
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

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function ViewPlanOfferPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const [offer, setOffer] = useState<PlanOffer | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
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

  const conflictHandleMap: Record<number, string> = {
    1: "Highest Discount",
    2: "Lowest Discount",
    3: "Newest Offer",
    4: "Oldest Offer",
    5: "Stack Offers",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const [offerRes, durationsRes, devicesRes] = await Promise.all([
          fetch(`${API_URL}/plan-offers/${id}?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/durations?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/device-types?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (!offerRes.ok) {
          throw new Error("Failed to fetch offer");
        }

        const offerData = await offerRes.json();
        setOffer(offerData.data);

        // Fetch plan details
        const planResponse = await fetch(`${API_URL}/plans/${offerData.data.planId}?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (planResponse.ok) {
          const planData = await planResponse.json();
          setPlan(planData.data);
        }

        if (durationsRes.ok) {
          const durationsData = await durationsRes.json();
          setDurations(durationsData.data.data);
        }

        if (devicesRes.ok) {
          const devicesData = await devicesRes.json();
          setDeviceTypes(devicesData.data);
        }
      } catch (err) {
        setError("Failed to load offer details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, platformId]);

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

  const getDiscountTypeBadge = (type: number) => {
    return type === 1 ? (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        Percentage Discount
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        Fixed Amount Discount
      </span>
    );
  };

  const formatDiscount = (type: number, value: number) => {
    if (type === 1) {
      return `${value}% OFF`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  const getDurationName = (durationId: number) => {
    const duration = durations.find(d => d.id === durationId);
    return duration ? `${duration.displayName} (${duration.durationDays} days)` : `Duration ID: ${durationId}`;
  };

  const getDeviceName = (deviceId: number) => {
    const device = deviceTypes.find(d => d.id === deviceId);
    return device ? `${device.deviceName} (${device.deviceCode})` : `Device ID: ${deviceId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading offer details...</p>
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
        title="Offer Details"
        // description="View and manage offer configuration"
        breadcrumbItems={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Plans Section", href: "/admin/dashboard/plans-section" },
            { label: "Plan Offers", href: "/admin/dashboard/plans-section/plan-offers" },
            { label: "Details" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/plan-offers",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
          {
            href: `/admin/dashboard/plans-section/plan-offers/edit/${id}`,
            label: "Edit Offer",
            icon: <Edit className="h-4 w-4" />,
            variant: 'primary',
            permission: { 
              resource: "plan-offers", 
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
            <div className="text-6xl mb-2">🏷️</div>
            <h2 className="text-3xl font-bold">{offer?.name}</h2>
            <p className="mt-2 text-white/80">Promotional offer for subscription plans</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Offer ID</div>
            <div className="text-2xl font-bold">#{offer?.id}</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Offer Name</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{offer?.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Associated Plan</p>
            <Link
              href={`/admin/dashboard/plans-section/plans/view/${plan?.id}`}
              className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-purple-600 hover:underline dark:text-purple-400"
            >
              {plan?.name || `Plan #${offer?.planId}`}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount Type</p>
            <div className="mt-1">{offer && getDiscountTypeBadge(offer.discountType)}</div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount Value</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {offer && formatDiscount(offer.discountType, offer.discountValue)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicable Durations</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {offer?.applicableDurationIds.map((durationId) => (
                <span
                  key={durationId}
                  className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                >
                  {getDurationName(durationId)}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conflict Handling</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {offer && conflictHandleMap[offer.conflictHandleDiscount]}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">{formatDate(offer?.startDate || null)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">{formatDate(offer?.endDate || null)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-1">{offer && getStatusBadge(offer.isActive)}</div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">{offer?.createdAt ? formatDate(offer.createdAt) : "-"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="mt-1 text-gray-900 dark:text-white">{offer?.updatedAt ? formatDate(offer.updatedAt) : "-"}</p>
          </div>
        </div>

        {/* Device Types Section */}
        {offer?.applicableDeviceCodes && offer.applicableDeviceCodes.length > 0 && (
          <>
            <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicable Device Types</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {offer.applicableDeviceCodes.map((deviceId) => (
                  <span
                    key={deviceId}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                  >
                    {getDeviceName(deviceId)}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Description */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
          <div className="mt-3 rounded-xl bg-gray-50 p-4 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
            {offer?.description || "No description provided."}
          </div>
        </div>
      </div>

      {/* Extra Info Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Offer ID</h4>
          <p className="mt-2 text-xl font-bold">{offer?.id}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Plan ID</h4>
          <p className="mt-2 text-xl font-bold">{offer?.planId}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Discount</h4>
          <p className="mt-2 text-xl font-bold">
            {offer && formatDiscount(offer.discountType, offer.discountValue)}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Current Status</h4>
          <p className="mt-2 text-lg font-semibold">
            {offer?.isActive === 1 ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </div>
  );
}
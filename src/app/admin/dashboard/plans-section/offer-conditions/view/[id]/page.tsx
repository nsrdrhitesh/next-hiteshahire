"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";

interface OfferCondition {
  id: number;
  platformId: number;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  gender: number[] | null;
  city: number[] | null;
  state: number[] | null;
  country: number[] | null;
  religionIds: number[] | null;
  casteIds: number[] | null;
  motherTongueIds: number[] | null;
  annualIncome: number | null;
  wealth: number | null;
  nri: number;
  applicablePlanIds: number[] | null;
  applicableDiscountIds: number[] | null;
  applicableDeviceCodes: number[] | null;
  planStartTimeAfterApproval: number | null;
  planEndTimeAfterApproval: number | null;
  timespanRegApprovalGt: number | null;
  timespanRegApprovalLt: number | null;
  planStartDate: string | null;
  planEndDate: string | null;
  registrationStartTime: number | null;
  registrationEndTime: number | null;
  afterApprovalDate: string | null;
  beforeApprovalDate: string | null;
  afterRegistrationDate: string | null;
  beforeRegistrationDate: string | null;
  conditionShortOrder: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: number;
  name: string;
}

interface Offer {
  id: number;
  name: string;
}

interface DeviceType {
  id: number;
  deviceCode: string;
  deviceName: string;
}

export default function ViewOfferConditionPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const [condition, setCondition] = useState<OfferCondition | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const genderMap: Record<number, string> = {
    1: "Male",
    2: "Female",
    3: "Other",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const [conditionRes, plansRes, offersRes, devicesRes] = await Promise.all([
          fetch(`${API_URL}/offer-conditions/${id}?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/plans?platformId=${platformId}&limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/plan-offers?platformId=${platformId}&limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/device-types?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (!conditionRes.ok) {
          throw new Error("Failed to fetch condition");
        }

        const conditionData = await conditionRes.json();
        setCondition(conditionData.data);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData.data.data);
        }

        if (offersRes.ok) {
          const offersData = await offersRes.json();
          setOffers(offersData.data.data);
        }

        if (devicesRes.ok) {
          const devicesData = await devicesRes.json();
          setDeviceTypes(devicesData.data.data);
        }
      } catch (err) {
        setError("Failed to load condition details");
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

  const formatList = (items: number[] | null, map: Record<number, string> = {}) => {
    if (!items || items.length === 0) return "Any";
    return items.map(item => map[item] || item).join(", ");
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "Any";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (hours: number | null) => {
    if (hours === null) return "Not set";
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  };

  const formatPlanNames = (planIds: number[] | null) => {
    if (!planIds || planIds.length === 0) return "All Plans";
    return planIds.map(id => plans.find(p => p.id === id)?.name || `Plan #${id}`).join(", ");
  };

  const formatOfferNames = (offerIds: number[] | null) => {
    if (!offerIds || offerIds.length === 0) return "All Offers";
    return offerIds.map(id => offers.find(o => o.id === id)?.name || `Offer #${id}`).join(", ");
  };

  const formatDeviceNames = (deviceIds: number[] | null) => {
    if (!deviceIds || deviceIds.length === 0) return "All Devices";
    return deviceIds.map(id => {
      const device = deviceTypes.find(d => d.id === id);
      return device ? `${device.deviceName} (${device.deviceCode})` : `Device ID: ${id}`;
    }).join(", ");
  };

  const formatAgeRange = (min: number | null, max: number | null) => {
    if (min && max) return `${min} - ${max} years`;
    if (min) return `${min}+ years`;
    if (max) return `Up to ${max} years`;
    return "Any age";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading condition details...</p>
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Plans Section", href: "/admin/dashboard/plans-section" },
              { label: "Offer Conditions", href: "/admin/dashboard/plans-section/offer-conditions" },
              { label: "Details" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Condition Details</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Complete overview of offer eligibility condition</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/offer-conditions"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back
          </Link>
          <Link
            href={`/admin/dashboard/plans-section/offer-conditions/edit/${condition?.id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg"
          >
            Edit Condition
          </Link>
        </div>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-6xl mb-2">⚙️</div>
            <h2 className="text-3xl font-bold">{condition?.name}</h2>
            <p className="mt-2 text-white/80">Offer eligibility condition</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Condition ID</div>
            <div className="text-2xl font-bold">#{condition?.id}</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition Name</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{condition?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sort Order</p>
            <p className="mt-1 text-gray-900 dark:text-white">{condition?.conditionShortOrder || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-1">{condition && getStatusBadge(condition.isActive)}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">{condition?.createdAt ? formatDate(condition.createdAt) : "-"}</p>
          </div>
        </div>

        {/* Demographic Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Demographic Rules</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Age Range</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatAgeRange(condition?.minAge || null, condition?.maxAge || null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatList(condition?.gender || null, genderMap)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cities</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatList(condition?.city || null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">States</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatList(condition?.state || null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Countries</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatList(condition?.country || null)}</p>
            </div>
          </div>
        </div>

        {/* Religion, Caste, Mother Tongue Section */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Religious & Cultural Rules
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Religions</p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {condition?.religionIds && condition.religionIds.length > 0 
                  ? `IDs: ${condition.religionIds.join(", ")}` 
                  : "All Religions"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Castes</p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {condition?.casteIds && condition.casteIds.length > 0 
                  ? `IDs: ${condition.casteIds.join(", ")}` 
                  : "All Castes"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mother Tongues</p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {condition?.motherTongueIds && condition.motherTongueIds.length > 0 
                  ? `IDs: ${condition.motherTongueIds.join(", ")}` 
                  : "All Mother Tongues"}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Section */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Rules</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Annual Income</p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {formatCurrency(condition?.annualIncome ?? null)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wealth / Net Worth</p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {formatCurrency(condition?.wealth ?? null)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">NRI Status</p>
              <p className="mt-1 text-gray-900 dark:text-white">{condition?.nri === 1 ? "NRI Only" : "All"}</p>
            </div>
          </div>
        </div>

        {/* Applicability Section */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applicability Rules</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicable Plans</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatPlanNames(condition?.applicablePlanIds ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicable Offers</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatOfferNames(condition?.applicableDiscountIds ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicable Devices</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatDeviceNames(condition?.applicableDeviceCodes ?? null)}</p>
            </div>
          </div>
        </div>

        {/* Timing Rules Section */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timing Rules</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Start Time (after approval)</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatTime(condition?.planStartTimeAfterApproval ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan End Time (after approval)</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatTime(condition?.planEndTimeAfterApproval ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration to Approval (greater than)</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatTime(condition?.timespanRegApprovalGt ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration to Approval (less than)</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatTime(condition?.timespanRegApprovalLt ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Start Date</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatDate(condition?.planStartDate ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan End Date</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatDate(condition?.planEndDate ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Start Time</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatTime(condition?.registrationStartTime ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration End Time</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatTime(condition?.registrationEndTime ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">After Approval Date</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatDate(condition?.afterApprovalDate ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Before Approval Date</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatDate(condition?.beforeApprovalDate ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">After Registration Date</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatDate(condition?.afterRegistrationDate ?? null)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Before Registration Date</p>
              <p className="mt-1 text-gray-900 dark:text-white">{formatDate(condition?.beforeRegistrationDate ?? null)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Info Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Condition ID</h4>
          <p className="mt-2 text-xl font-bold">{condition?.id}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Last Updated</h4>
          <p className="mt-2 text-sm">{condition?.updatedAt ? formatDate(condition.updatedAt) : "-"}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Sort Order</h4>
          <p className="mt-2 text-xl font-bold">{condition?.conditionShortOrder || 0}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Current Status</h4>
          <p className="mt-2 text-lg font-semibold">{condition?.isActive === 1 ? "Active" : "Inactive"}</p>
        </div>
      </div>
    </div>
  );
}
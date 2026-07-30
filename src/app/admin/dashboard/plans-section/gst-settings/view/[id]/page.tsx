"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";

interface GstSetting {
  id: number;
  platformId: number;
  name: string;
  percentage: number;
  stateIds: number[] | null;
  countryIds: number[] | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewGstSettingPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const [setting, setSetting] = useState<GstSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/gst-settings/${id}?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch GST setting");
        }

        const result = await response.json();
        setSetting(result.data);
      } catch (err) {
        setError("Failed to load GST setting details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSetting();
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

  const formatPercentage = (percentage: number) => {
    return `${percentage}%`;
  };

  const formatList = (ids: number[] | null) => {
    if (!ids || ids.length === 0) return "All";
    return ids.join(", ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateTaxAmount = (baseAmount: number = 1000) => {
    return (baseAmount * (setting?.percentage || 0)) / 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading GST setting details...</p>
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
              { label: "GST Settings", href: "/admin/dashboard/plans-section/gst-settings" },
              { label: "Details" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GST Setting Details</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Complete overview of GST configuration</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/gst-settings"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back
          </Link>
          <Link
            href={`/admin/dashboard/plans-section/gst-settings/edit/${setting?.id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg"
          >
            Edit GST Setting
          </Link>
        </div>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-6xl mb-2">💰</div>
            <h2 className="text-3xl font-bold">{setting?.name}</h2>
            <p className="mt-2 text-white/80">GST Configuration for tax calculation</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">GST Rate</div>
            <div className="text-4xl font-bold">{formatPercentage(setting?.percentage || 0)}</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Setting Name</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{setting?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">GST Rate</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{formatPercentage(setting?.percentage || 0)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicable States</p>
            <p className="mt-1 text-gray-900 dark:text-white">{formatList(setting?.stateIds || null)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicable Countries</p>
            <p className="mt-1 text-gray-900 dark:text-white">{formatList(setting?.countryIds || null)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-1">{setting && getStatusBadge(setting.isActive)}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">{setting?.createdAt ? formatDate(setting.createdAt) : "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="mt-1 text-gray-900 dark:text-white">{setting?.updatedAt ? formatDate(setting.updatedAt) : "-"}</p>
          </div>
        </div>
      </div>

      {/* Tax Calculation Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tax Calculation Example</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Base Amount</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹1,000.00</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">GST Amount</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{calculateTaxAmount().toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">({setting?.percentage}% of base amount)</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{(1000 + calculateTaxAmount()).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Extra Info Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Setting ID</h4>
          <p className="mt-2 text-xl font-bold">{setting?.id}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">GST Rate</h4>
          <p className="mt-2 text-xl font-bold">{formatPercentage(setting?.percentage || 0)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Applicable Regions</h4>
          <p className="mt-2 text-lg font-semibold">
            {setting?.stateIds || setting?.countryIds ? "Selected" : "All Regions"}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Current Status</h4>
          <p className="mt-2 text-lg font-semibold">
            {setting?.isActive === 1 ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </div>
  );
}
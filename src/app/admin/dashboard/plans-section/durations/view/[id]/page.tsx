"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";

interface Duration {
  id: number;
  platformId: number;
  durationDays: number;
  displayName: string;
  description: string | null;
  sortOrder: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewDurationPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const [duration, setDuration] = useState<Duration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDuration = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/durations/${id}?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch duration");
        }

        const result = await response.json();
        setDuration(result.data);
      } catch (err) {
        setError("Failed to load duration details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDuration();
    }
  }, [id, platformId]);

  const formatDurationDisplay = (days: number, displayName: string) => {
    return displayName;
  };

  const getDurationIcon = (days: number) => {
    if (days <= 14) return "⚡";
    if (days <= 60) return "📅";
    if (days <= 180) return "📈";
    if (days <= 365) return "🌟";
    return "🏆";
  };

  const getDurationColor = (days: number) => {
    if (days <= 14) return "from-green-500 to-emerald-500";
    if (days <= 60) return "from-blue-500 to-indigo-500";
    if (days <= 180) return "from-purple-500 to-pink-500";
    if (days <= 365) return "from-orange-500 to-red-500";
    return "from-red-500 to-rose-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
          <p className="text-gray-600 dark:text-gray-400">Loading duration details...</p>
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
              { label: "Durations", href: "/admin/dashboard/plans-section/durations" },
              { label: "Details" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Duration Details</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Complete overview of subscription duration information</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/durations"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back
          </Link>
          <Link
            href={`/admin/dashboard/plans-section/durations/edit/${duration?.id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg"
          >
            Edit Duration
          </Link>
        </div>
      </div>

      {/* Hero Card */}
      <div className={`rounded-2xl bg-gradient-to-r ${getDurationColor(duration?.durationDays || 30)} p-8 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-6xl mb-2">{getDurationIcon(duration?.durationDays || 30)}</div>
            <h2 className="text-3xl font-bold">{formatDurationDisplay(duration?.durationDays || 0, duration?.displayName || "")}</h2>
            <p className="mt-2 text-white/80">{duration?.durationDays} days subscription period</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Duration ID</div>
            <div className="text-2xl font-bold">#{duration?.id}</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{duration?.displayName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration (Days)</p>
            <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{duration?.durationDays} days</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {Math.floor((duration?.durationDays || 0) / 30)} months, {(duration?.durationDays || 0) % 30} days
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sort Order</p>
            <p className="mt-1 text-gray-900 dark:text-white">{duration?.sortOrder || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-1">{duration && getStatusBadge(duration.isActive)}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">{duration?.createdAt ? formatDate(duration.createdAt) : "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="mt-1 text-gray-900 dark:text-white">{duration?.updatedAt ? formatDate(duration.updatedAt) : "-"}</p>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
          <div className="mt-3 rounded-xl bg-gray-50 p-4 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
            {duration?.description || "No description provided."}
          </div>
        </div>
      </div>

      {/* Duration Calculator */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Duration Calculator</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{duration?.durationDays}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Weeks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.floor((duration?.durationDays || 0) / 7)} weeks
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{(duration?.durationDays || 0) % 7} days remaining</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Months</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.floor((duration?.durationDays || 0) / 30)} months
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Approximately</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <p className="text-sm text-gray-500 dark:text-gray-400">Billing Cycle</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {duration?.durationDays === 365 ? "Annual" : 
               duration?.durationDays === 30 ? "Monthly" :
               duration?.durationDays === 90 ? "Quarterly" :
               duration?.durationDays === 180 ? "Half-Yearly" :
               `${duration?.durationDays}-Day`}
            </p>
          </div>
        </div>
      </div>

      {/* Extra Info Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Duration ID</h4>
          <p className="mt-2 text-xl font-bold">{duration?.id}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Total Days</h4>
          <p className="mt-2 text-xl font-bold">{duration?.durationDays}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Period Type</h4>
          <p className="mt-2 text-lg font-semibold">
            {duration?.durationDays === 365 ? "Yearly" : 
             duration?.durationDays === 30 ? "Monthly" :
             duration?.durationDays === 90 ? "Quarterly" : "Custom"}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Sort Order</h4>
          <p className="mt-2 text-xl font-bold">{duration?.sortOrder || 0}</p>
        </div>
      </div>
    </div>
  );
}
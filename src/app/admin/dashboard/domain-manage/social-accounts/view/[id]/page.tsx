"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';

interface SocialAccountData {
  id: number;
  platform_id: number;
  account_url: string;
  icon_class: string | null;
  display_order: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export default function ViewDomainSocialAccount() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [data, setData] = useState<SocialAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedPlatformId = localStorage.getItem("selected_platform_id");

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return router.push("/login");

        const res = await fetch(`${API_URL}/domain/social-accounts/${selectedPlatformId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load social account details");

        const result = await res.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAccount();
  }, [id, router, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading social account details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Social account not found"}
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300">
        Inactive
      </span>
    );
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Domain Management', href: '/admin/dashboard/domain-manage' },
              { label: 'Social Account', href: '/admin/dashboard/domain-manage/social-accounts' },
              { label: 'View' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Social Account Details
          </h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            View social media link configuration
          </p> */}
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/domain-manage/social-accounts"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back to List
          </Link>
          <Link
            href={`/admin/dashboard/domain-manage/social-accounts/edit/${id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
          >
            Edit Account
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Account Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Platform ID</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {data.platform_id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className="mt-1">{getStatusBadge(data.status)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Account URL</p>
                <a
                  href={data.account_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {data.account_url}
                </a>
              </div>
            </div>
          </div>

          {/* Display & Icon */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Display Settings
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Display Order</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {data.display_order}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Icon Class</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  {data.icon_class ? (
                    <>
                      <i className={`${data.icon_class} text-xl`}></i>
                      <span>{data.icon_class}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Activity
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(data.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(data.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar preview / info */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Preview</h3>
            <div className="flex items-center gap-4 rounded-lg bg-white/20 p-4 backdrop-blur-sm">
              {data.icon_class ? (
                <i className={`${data.icon_class} text-3xl`}></i>
              ) : (
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                </svg>
              )}
              <div>
                <p className="font-medium">{data.account_url.split("/").pop() || "Social Profile"}</p>
                <a
                  href={data.account_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/80 hover:text-white hover:underline"
                >
                  Open profile →
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href={data.account_url}
                target="_blank"
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Visit Profile
              </Link>
              <Link
                href={`/admin/dashboard/domain-manage/social-accounts/edit/${id}`}
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Edit Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
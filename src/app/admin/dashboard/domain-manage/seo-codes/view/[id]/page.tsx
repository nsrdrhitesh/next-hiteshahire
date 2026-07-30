"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';

const ACCOUNT_TYPE_LABELS: Record<number, string> = {
  1: "Facebook Pixel",
  2: "Google Tag Manager",
  3: "Google Analytics (GA4)",
  4: "Snapchat Pixel",
  5: "Microsoft Clarity",
};

const POSITION_TYPE_LABELS: Record<number, string> = {
  1: "Inside <head>",
  2: "Before </body>",
  3: "Right after <body>",
};

interface SeoCodeData {
  id: number;
  platformId: number;
  accountType: number;
  accountCode: string;
  positionType: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewDomainSeoCode() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [data, setData] = useState<SeoCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedPlatformId = localStorage.getItem("selected_platform_id");

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return router.push("/login");

        const res = await fetch(`${API_URL}/domain/seo-codes/${selectedPlatformId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load tracking code details");

        const result = await res.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCode();
  }, [id, router, API_URL]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading code details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Tracking code not found"}
        </p>
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
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Domain Management', href: '/admin/dashboard/domain-manage' },
              { label: 'SEO Code', href: '/admin/dashboard/domain-manage/seo-codes' },
              { label: 'View' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tracking / SEO Code Details
          </h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            Full view of pixel, tag or analytics configuration
          </p> */}
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/domain-manage/seo-codes"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back to List
          </Link>
          <Link
            href={`/admin/dashboard/domain-manage/seo-codes/edit/${id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
          >
            Edit Code
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Platform ID</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{data.platformId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {ACCOUNT_TYPE_LABELS[data.accountType] || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {POSITION_TYPE_LABELS[data.positionType] || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(data.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(data.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Code Snippet
            </h3>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 font-mono text-sm leading-relaxed text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {data.accountCode}
            </pre>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Info</h3>
            <ul className="space-y-2 text-sm">
              <li>• Position: <strong>{POSITION_TYPE_LABELS[data.positionType]}</strong></li>
              <li>• Type: <strong>{ACCOUNT_TYPE_LABELS[data.accountType]}</strong></li>
              <li>• Platform: <strong>{data.platformId}</strong></li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Usage Notes
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Code is injected based on selected position</li>
              <li>• Always test after changes</li>
              <li>• Avoid duplicate codes on same page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
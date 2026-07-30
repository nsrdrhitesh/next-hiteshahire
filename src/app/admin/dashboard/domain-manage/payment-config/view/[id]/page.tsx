"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';

interface PaymentConfig {
  id: number;
  platformId: number;
  gatewayName: string;
  merchantId?: string;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  mode: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewDomainPaymentConfig() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [data, setData] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedPlatformId = localStorage.getItem("selected_platform_id");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return router.push("/login");

        const res = await fetch(`${API_URL}/domain/payment-config/${selectedPlatformId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load payment configuration");

        const result = await res.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchConfig();
  }, [id, router, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading payment configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Configuration not found"}
        </p>
      </div>
    );
  }

  const modeText = data.mode === 1 ? "Test" : data.mode === 2 ? "Live" : "—";
  const statusText = data.status === 1 ? "Active" : data.status === 2 ? "Inactive" : "—";

  const maskSecret = (value?: string) =>
    value ? "••••••••" + value.slice(-6) : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Domain Management', href: '/admin/dashboard/domain-manage' },
              { label: 'Payment Config', href: '/admin/dashboard/domain-manage/payment-config' },
              { label: 'View' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Gateway Details
          </h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            Full configuration overview for this gateway
          </p> */}
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/domain-manage/payment-config"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back to List
          </Link>
          <Link
            href={`/admin/dashboard/domain-manage/payment-config/edit/${id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
          >
            Edit Configuration
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              General Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Platform ID" value={data.platformId} />
              <DetailItem label="Gateway Name" value={data.gatewayName} />
              <DetailItem label="Merchant ID" value={data.merchantId || "—"} />
              <DetailItem label="Mode" value={modeText} />
              <DetailItem label="Status" value={statusText} />
              <DetailItem label="Created" value={new Date(data.createdAt).toLocaleString()} />
              <DetailItem label="Last Updated" value={new Date(data.updatedAt).toLocaleString()} />
            </div>
          </div>

          {/* Credentials */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Credentials & Keys
            </h3>
            <div className="space-y-4">
              <DetailItem label="Public Key / Publishable Key" value={data.publicKey || "—"} />
              <DetailItem label="Secret Key" value={maskSecret(data.secretKey)} />
              <DetailItem label="Webhook Secret" value={maskSecret(data.webhookSecret)} />
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Secret values are masked for security. Edit to view or change them.
            </p>
          </div>
        </div>

        {/* Right - Summary Card */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Summary</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Gateway:</span> {data.gatewayName}
              </p>
              <p>
                <span className="font-medium">Platform:</span> #{data.platformId}
              </p>
              <p>
                <span className="font-medium">Environment:</span>{" "}
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    data.mode === 1
                      ? "bg-yellow-200/30 text-yellow-100"
                      : "bg-green-200/30 text-green-100"
                  }`}
                >
                  {modeText}
                </span>
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    data.status === 1
                      ? "bg-green-200/30 text-green-100"
                      : "bg-red-200/30 text-red-100"
                  }`}
                >
                  {statusText}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Component */
function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-all">
        {value}
      </p>
    </div>
  );
}
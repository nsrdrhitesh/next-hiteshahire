"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';

interface BrandingData {
  platform_id: number;
  site_name: string;
  logo?: string;
  favicon?: string;
  primary_color?: string;
  secondary_color?: string;
  ternary_color?: string;
  fourth_color?: string;
  fifth_color?: string;
  primary_font_family?: string;
  secondary_font_family?: string;
  ternary_font_family?: string;
  footer_text?: string;
}

export default function ViewDomainBranding() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [data, setData] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedPlatformId = localStorage.getItem("selected_platform_id");

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return router.push("/login");

        const res = await fetch(`${API_URL}/domain/branding/${selectedPlatformId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load branding details");

        const result = await res.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBranding();
  }, [id, router, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading branding details...</p>
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

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          {/* Inside your component: */}
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Domain Management', href: '/admin/dashboard/domain-manage' },
              { label: 'Branding', href: '/admin/dashboard/domain-manage/branding' },
              { label: 'View' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Domain Branding Details
          </h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete branding configuration overview
          </p> */}
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/domain-manage/branding"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back
          </Link>
          <Link
            href={`/admin/dashboard/domain-manage/branding/edit/${id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
          >
            Edit Branding
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Platform ID" value={data.platform_id} />
              <DetailItem label="Site Name" value={data.site_name} />
            </div>
          </div>

          {/* Logo & Favicon */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Branding Assets
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ImagePreview title="Logo" src={data.logo} />
              <ImagePreview title="Favicon" src={data.favicon} small />
            </div>
          </div>

          {/* Colors */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Color Palette
            </h3>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {[
                { label: "Primary", value: data.primary_color },
                { label: "Secondary", value: data.secondary_color },
                { label: "Ternary", value: data.ternary_color },
                { label: "Fourth", value: data.fourth_color },
                { label: "Fifth", value: data.fifth_color },
              ].map((color, index) => (
                <div key={index} className="text-center">
                  <div
                    className="mx-auto mb-2 h-16 w-16 rounded-lg border shadow-sm"
                    style={{ backgroundColor: color.value || "#eee" }}
                  />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {color.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {color.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Font Settings
            </h3>

            <div className="space-y-3">
              <DetailItem label="Primary Font" value={data.primary_font_family} />
              <DetailItem label="Secondary Font" value={data.secondary_font_family} />
              <DetailItem label="Ternary Font" value={data.ternary_font_family} />
            </div>
          </div>

          {/* Footer */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Footer Text
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {data.footer_text || "—"}
            </p>
          </div>
        </div>

        {/* Right Sidebar Preview */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
            <div
              className="rounded-lg p-4 shadow-inner"
              style={{
                backgroundColor: data.primary_color || "#fff",
                color: data.secondary_color || "#000",
                fontFamily: data.primary_font_family || "inherit",
              }}
            >
              <h4 className="text-xl font-bold">{data.site_name}</h4>
              <p className="text-sm mt-2">
                This is how your branding will appear.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {value || "—"}
      </p>
    </div>
  );
}

function ImagePreview({
  title,
  src,
  small,
}: {
  title: string;
  src?: string;
  small?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        {title}
      </p>
      {src ? (
        <img
          src={src}
          alt={title}
          className={`mx-auto rounded shadow ${
            small ? "h-20 w-20 object-cover" : "max-h-32 object-contain"
          }`}
        />
      ) : (
        <div className="mx-auto h-20 w-20 rounded bg-gray-200 dark:bg-gray-700" />
      )}
    </div>
  );
}
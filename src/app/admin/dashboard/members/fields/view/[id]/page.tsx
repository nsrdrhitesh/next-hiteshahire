"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";

interface MemberField {
  id: number;
  name: string;
  fieldKey: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewMemberField() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [field, setField] = useState<MemberField | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchField = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return router.push("/login");

        const res = await fetch(`${API_URL}/member-fields/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load field");
        const data = await res.json();
        setField(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchField();
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
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800">Member field not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with custom breadcrumb and buttons */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Member Fields", href: "/admin/dashboard/member-fields" },
              { label: "View" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Field Details</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/member-fields"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            Back to List
          </Link>
          <Link
            href={`/admin/dashboard/member-fields/edit/${field.id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
          >
            Edit Field
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{field.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Display Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{field.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Field Key</p>
                <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {field.fieldKey}
                </code>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(field.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(field.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Info</h3>
            <ul className="space-y-2 text-sm">
              <li>• Field Key: <strong>{field.fieldKey}</strong></li>
              <li>• Used in dynamic forms</li>
              <li>• Can be assigned to platforms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
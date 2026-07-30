"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";

export default function ViewPlatformMemberField() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return router.push("/login");

        const res = await fetch(`${API_URL}/platform-member-fields/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        // enrich with platform and field names
        const [platRes, fieldRes] = await Promise.all([
          fetch(`${API_URL}/platforms/${data.platformId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/member-fields/${data.memberFieldId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const platform = await platRes.json();
        const memberField = await fieldRes.json();
        setAssignment({ ...data, platform, memberField });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAssignment();
  }, [id, router, API_URL]);

  const getFormTypeLabel = (type: number) => {
    switch (type) {
      case 1: return "Registration Only";
      case 2: return "Detail Page Only";
      case 3: return "Both";
      default: return "Unknown";
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" /></div>;
  if (!assignment) return <div className="p-4 text-red-600">Assignment not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Platform Fields", href: "/admin/dashboard/platform-member-fields" },
            { label: "View" },
          ]} />
          <h1 className="text-2xl font-bold">Field Assignment Details</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/dashboard/platform-member-fields" className="rounded-lg border px-4 py-2.5 text-sm">Back</Link>
          <Link href={`/admin/dashboard/platform-member-fields/edit/${assignment.id}`} className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-white">Edit</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Assignment Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><p className="text-xs text-gray-500">ID</p><p className="text-sm font-medium">{assignment.id}</p></div>
              <div><p className="text-xs text-gray-500">Platform</p><p className="text-sm font-medium">{assignment.platform?.name} ({assignment.platform?.code})</p></div>
              <div><p className="text-xs text-gray-500">Member Field</p><p className="text-sm font-medium">{assignment.memberField?.name} <code className="ml-1 text-xs">({assignment.memberField?.fieldKey})</code></p></div>
              <div><p className="text-xs text-gray-500">Form Type</p><p className="text-sm font-medium">{getFormTypeLabel(assignment.formTypeId)}</p></div>
              <div><p className="text-xs text-gray-500">Created</p><p className="text-sm">{new Date(assignment.createdAt).toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-500">Last Updated</p><p className="text-sm">{new Date(assignment.updatedAt).toLocaleString()}</p></div>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold mb-3">Field Usage</h3>
          <ul className="space-y-2 text-sm">
            <li>• Will appear on: <strong>{getFormTypeLabel(assignment.formTypeId)}</strong></li>
            <li>• Field Key: <strong>{assignment.memberField?.fieldKey}</strong></li>
            <li>• Platform: <strong>{assignment.platform?.name}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
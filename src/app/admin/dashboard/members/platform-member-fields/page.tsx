"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../../components/ui/PageHeader";
import { showSuccess, showError } from "../../lib/swalHelper";

interface PlatformMemberField {
  id: number;
  platformId: number;
  memberFieldId: number;
  formTypeId: number;
  platform?: { id: number; name: string };
  memberField?: { id: number; name: string; fieldKey: string };
}

export default function PlatformMemberFieldsPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [assignments, setAssignments] = useState<PlatformMemberField[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [memberFields, setMemberFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const [assignRes, platformRes, fieldRes] = await Promise.all([
        fetch(`${API_URL}/platform-member-fields`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/platforms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/member-fields`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const assignmentsData = await assignRes.json();
      const platformsData = await platformRes.json();
      const fieldsData = await fieldRes.json();

      // Enrich assignments with platform and field names
      const enriched = assignmentsData.map((a: any) => ({
        ...a,
        platform: platformsData.find((p: any) => p.id === a.platformId),
        memberField: fieldsData.find((f: any) => f.id === a.memberFieldId),
      }));

      setAssignments(enriched);
      setPlatforms(platformsData);
      setMemberFields(fieldsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this field assignment?")) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/platform-member-fields/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Deletion failed");
      await showSuccess("Assignment removed");
      fetchData();
    } catch (err: any) {
      await showError(err.message);
    }
  };

  const getFormTypeLabel = (type: number) => {
    switch (type) {
      case 1: return "Registration";
      case 2: return "Detail";
      case 3: return "Both";
      default: return "Unknown";
    }
  };

  const filtered = assignments.filter(
    (a) =>
      a.platform?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.memberField?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFormTypeLabel(a.formTypeId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Field Assignments"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Platform Fields" },
        ]}
        createButton={{
          href: "/admin/dashboard/platform-member-fields/create",
          label: "Assign Field",
          permission: { resource: "platform-member-fields", action: "create" },
        }}
        permissions={permissions}
      />

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="relative max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by platform, field, or form type..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500"
              />
            </div>
          </div>
          <button onClick={() => setSearchTerm("")} className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm">Clear</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Member Field</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Form Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{a.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{a.platform?.name || a.platformId}</td>
                <td className="px-6 py-4 text-sm">{a.memberField?.name || a.memberFieldId}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    a.formTypeId === 1 ? "bg-green-100 text-green-800" :
                    a.formTypeId === 2 ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}>{getFormTypeLabel(a.formTypeId)}</span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => router.push(`/admin/dashboard/platform-member-fields/view/${a.id}`)} className="text-blue-600">View</button>
                  {hasPermission("platform-member-fields", "update") && (
                    <button onClick={() => router.push(`/admin/dashboard/platform-member-fields/edit/${a.id}`)} className="text-yellow-600">Edit</button>
                  )}
                  {hasPermission("platform-member-fields", "delete") && (
                    <button onClick={() => handleDelete(a.id)} className="text-red-600">Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No assignments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
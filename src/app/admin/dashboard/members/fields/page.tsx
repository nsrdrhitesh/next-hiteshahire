"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../../components/ui/PageHeader";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import { showSuccess, showError } from "../../lib/swalHelper";

interface MemberField {
  id: number;
  name: string;
  fieldKey: string;
  createdAt: string;
  updatedAt: string;
}

export default function MemberFieldsPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [fields, setFields] = useState<MemberField[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const res = await fetch(`${API_URL}/member-fields`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFields(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this field?")) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/member-fields/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await showSuccess("Member field deleted successfully");
      fetchFields();
    } catch (err: any) {
      await showError(err.message);
    }
  };

  const filteredFields = fields.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fieldKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Fields Management"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Member Fields" },
        ]}
        createButton={{
          href: "/admin/dashboard/members/fields/create",
          label: "Add New Field",
          permission: { resource: "member-fields", action: "create" },
        }}
        permissions={permissions}
      />

      {/* Search */}
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
                placeholder="Search by name or field key..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={() => setSearchTerm("")}
            className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Field Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFields.map((field) => (
              <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {field.id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {field.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                    {field.fieldKey}
                  </code>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(field.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => router.push(`/admin/dashboard/member-fields/view/${field.id}`)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                  >
                    View
                  </button>
                  {hasPermission("member-fields", "update") && (
                    <button
                      onClick={() => router.push(`/admin/dashboard/member-fields/edit/${field.id}`)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                    >
                      Edit
                    </button>
                  )}
                  {hasPermission("member-fields", "delete") && (
                    <button
                      onClick={() => handleDelete(field.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredFields.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No member fields found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
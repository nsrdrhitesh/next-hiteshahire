"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from '../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

export default function EditRolePage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    is_system: false,
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Fetch Role Details
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          `${API_URL}/roles/${roleId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "Failed to load role");

        setFormData({
          name: result.data.name,
          slug: result.data.slug,
          description: result.data.description || "",
          is_system: Boolean(result.data.is_system),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading role");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId, router]);

  // 🔹 Update Role
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("access_token");

      const res = await fetch(
        `${API_URL}/roles/${roleId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");
      await showSuccess("Branding record created successfully");
      router.push("/admin/dashboard/users/roles");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading role details...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Edit Role"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Staff", href: "/admin/dashboard/users" },
          { label: "Roles", href: "/admin/dashboard/users/roles" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/users/roles",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: isSaving ? "Saving..." : "Update Role",
            type: "submit",
            form: "role-form",
            variant: "primary",
            disabled: isSaving,
          },
        ]}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Role Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                // required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Slug (Readonly) */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Role Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                disabled
                className="block w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 p-3 text-gray-500 dark:border-gray-700 dark:bg-gray-700"
              />
              <p className="mt-2 text-sm text-gray-500">
                Slug cannot be modified after creation.
              </p>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Role Type
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                System Role
              </span>
              <input
                type="checkbox"
                checked={formData.is_system}
                disabled
                className="h-5 w-5 accent-purple-600"
              />
            </div>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              System roles are protected and cannot be deleted or modified.
            </p>

            <button
              type="submit"
              form="role-form"
              disabled={isSaving}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Update Role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

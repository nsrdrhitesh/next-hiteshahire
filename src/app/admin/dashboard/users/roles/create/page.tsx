"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from '../../../lib/swalHelper';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import PageHeader from "../../../components/ui/PageHeader";

export default function CreateRolePage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    is_system: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // const result = await response.json();

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        
        // Handle field validation errors from backend
        if (errData.message && typeof errData.message === 'object') {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errData.message).forEach(([field, msgs]) => {
            if (Array.isArray(msgs)) {
              fieldErrors[field] = msgs.join(', ');
            } else if (typeof msgs === 'string') {
              fieldErrors[field] = msgs;
            }
          });
          setErrors(fieldErrors);
        } else {
          setError(errData.message || 'Create failed');
        }
        setLoading(false);
        return;
      }

      await showSuccess("Branding record created successfully");
      router.push("/admin/dashboard/users/roles");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Create New Role"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Staff", href: "/admin/dashboard/users" },
          { label: "Roles", href: "/admin/dashboard/users/roles" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/users/roles",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: isLoading ? "Creating..." : "Create Role",
            type: "submit",
            form: "role-form",
            variant: "primary",
            disabled: isLoading,
          },
        ]}
      />

      {/* Error Alert */}
      {/* {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )} */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Role Name */}
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
                placeholder="e.g., Super Admin"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Role Slug <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  // required
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="super-admin"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  Generate
                </button>
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
              )}
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
                placeholder="Explain what this role can manage..."
              />
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Role Status */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Role Settings
            </h3>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                System Role
              </label>
              <input
                type="checkbox"
                name="is_system"
                checked={formData.is_system}
                onChange={handleChange}
                className="h-5 w-5 accent-purple-600"
              />
            </div>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              System roles cannot be deleted and have full control access.
            </p>

            <button
              type="submit"
              form="role-form"
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
            >
              Create Role
            </button>
          </div>

          {/* Info Box */}
          <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              About Roles
            </h4>
            <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              Roles help you group permissions and assign them to users. Use
              clear names and slugs for easier management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

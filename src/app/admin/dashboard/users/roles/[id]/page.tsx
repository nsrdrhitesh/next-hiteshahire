"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../components/ui/breadcrumb';

export default function ViewRolePage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to fetch role");
        }

        setRole(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId, router]);

  if (loading) {
    return <p className="text-gray-500">Loading role details...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error}
        </p>
      </div>
    );
  }

  if (!role) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Staff', href: '/admin/dashboard/users' },
              { label: 'Roles', href: '/admin/dashboard/users/roles' },
              { label: 'Details' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Role Details
          </h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            View complete role information
          </p> */}
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/users/roles"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            Back
          </Link>

          <Link
            href={`/admin/dashboard/users/roles/edit/${role.id}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
          >
            Edit Role
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Role Name
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {role.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Slug
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {role.slug}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Description
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {role.description || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Role ID
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {role.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  UUID
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white break-all">
                  {role.uuid}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created At
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(role.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Updated At
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(role.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
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

              {role.is_system ? (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  Yes
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  No
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {role.is_system
                ? "This is a protected system role."
                : "This is a custom role created by admin."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

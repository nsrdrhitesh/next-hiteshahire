"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from '../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface Permission {
  id: number;
  uuid: string;
  resource: string;
  action: string;
  name: string;
  description: string;
  isSensitive: boolean;
  grantedBy: 'role' | 'user' | null;
  isGranted: boolean;
}

interface Role {
  id: number;
  name: string;
  slug: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

export default function RolePermissionsPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResource, setSelectedResource] = useState<string>("all");
  const [showSensitive, setShowSensitive] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch role details and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        // Fetch role details
        const roleRes = await fetch(`${API_URL}/roles/${roleId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const roleData: ApiResponse<Role> = await roleRes.json();
        
        if (!roleRes.ok || !roleData.success) {
          throw new Error(roleData.message || "Failed to load role");
        }
        setRole(roleData.data);

        // Fetch permissions with role assignment status
        const permissionsRes = await fetch(`${API_URL}/permissions/role/${roleId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const permissionsData: ApiResponse<Permission[]> = await permissionsRes.json();
        
        if (!permissionsRes.ok || !permissionsData.success) {
          throw new Error(permissionsData.message || "Failed to load permissions");
        }
        setPermissions(permissionsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId, router]);

  // Toggle permission
  const togglePermission = (permissionId: number) => {
    setPermissions(prev => 
      prev.map(p => 
        p.id === permissionId 
          ? { ...p, isGranted: !p.isGranted, grantedBy: !p.isGranted ? 'role' : null }
          : p
      )
    );
  };

  // Toggle all permissions
  const toggleAllPermissions = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    setPermissions(prev => 
      prev.map(p => ({
        ...p,
        isGranted: newState,
        grantedBy: newState ? 'role' : null
      }))
    );
  };

  // Toggle all in resource group
  const toggleResourceGroup = (resource: string, currentState: boolean) => {
    setPermissions(prev => 
      prev.map(p => 
        p.resource === resource
          ? { ...p, isGranted: !currentState, grantedBy: !currentState ? 'role' : null }
          : p
      )
    );
  };

  // Save permissions
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const accessToken = localStorage.getItem("access_token");

      const grantedPermissionIds = permissions
        .filter(p => p.isGranted)
        .map(p => p.id);

      const response = await fetch(`${API_URL}/permissions/role/${roleId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId: parseInt(roleId),
          permissionIds: grantedPermissionIds,
          notes: "Updated via permissions manager",
        }),
      });

      const result: ApiResponse<Permission[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save permissions");
      }

      // Show success message
      await showSuccess("Branding record created successfully");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to save permissions");
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce<GroupedPermissions>((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  // Filter permissions based on search and filters
  const filteredResources = Object.entries(groupedPermissions)
    .map(([resource, perms]) => ({
      resource,
      permissions: perms.filter(p => {
        const matchesSearch = searchTerm === "" || 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSensitive = showSensitive ? true : !p.isSensitive;
        
        return matchesSearch && matchesSensitive;
      }),
    }))
    .filter(group => group.permissions.length > 0);

  // Calculate stats
  const totalPermissions = permissions.length;
  const grantedCount = permissions.filter(p => p.isGranted).length;
  const sensitiveCount = permissions.filter(p => p.isSensitive).length;

  // Get unique resources for filter
  const resources = Object.keys(groupedPermissions);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Staff', href: '/admin/dashboard/users' },
              { label: 'Roles', href: '/admin/dashboard/users/roles' },
              { label: 'Permissions' },
            ]}
          />
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Permissions
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Role: <span className="font-semibold text-purple-600 dark:text-purple-400">{role?.name}</span> ({role?.slug})
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/users/roles"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-lg disabled:opacity-70"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div> */}
      <PageHeader
        title="Manage Permissions"
        // description={`Role: ${role?.name} (${role?.slug})`}
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Staff", href: "/admin/dashboard/users" },
          { label: "Roles", href: "/admin/dashboard/users/roles" },
          { label: "Permissions" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/users/roles",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: saving ? "Saving..." : "Save Changes",
            onClick: handleSave,
            variant: "primary",
            disabled: saving,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Permissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPermissions}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Granted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{grantedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 011.789 2.894l-3.5 7A2 2 0 0111.264 14H10z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15h6m-3 3v-6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPermissions - grantedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sensitive</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sensitiveCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search permissions..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Resource Filter */}
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Resources</option>
              {resources.map(resource => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Show Sensitive Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSensitive}
                onChange={(e) => setShowSensitive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show sensitive only</span>
            </label>

            {/* Select All */}
            <button
              onClick={toggleAllPermissions}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {selectAll ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Permissions Grid */}
      <div className="space-y-6">
        {filteredResources.map(({ resource, permissions: resourcePerms }) => {
          const resourceGranted = resourcePerms.every(p => p.isGranted);
          const someGranted = resourcePerms.some(p => p.isGranted);

          return (
            <div key={resource} className="rounded-xl bg-white shadow-sm dark:bg-gray-800 overflow-hidden">
              {/* Resource Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {resource}
                    </h3>
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {resourcePerms.length} permissions
                    </span>
                  </div>
                  <button
                    onClick={() => toggleResourceGroup(resource, resourceGranted)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      resourceGranted
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
                        : someGranted
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {resourceGranted ? 'Revoke All' : 'Grant All'}
                  </button>
                </div>
              </div>

              {/* Permissions List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {resourcePerms.map((permission) => (
                  <div
                    key={permission.id}
                    className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      permission.isSensitive ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {permission.name}
                        </h4>
                        {permission.isSensitive && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Sensitive
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {permission.description || `${permission.resource}:${permission.action}`}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          {permission.action}
                        </span>
                        {permission.grantedBy === 'role' && (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Role-based
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => togglePermission(permission.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        permission.isGranted ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                          permission.isGranted ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm dark:bg-gray-800">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No permissions found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Save Bar (Sticky) */}
      <div className="sticky bottom-6 mt-6 flex justify-end">
        <div className="rounded-lg bg-white px-6 py-4 shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">{grantedCount}</span>
              <span className="text-gray-500 dark:text-gray-400"> of {totalPermissions} permissions selected</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-lg disabled:opacity-70"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
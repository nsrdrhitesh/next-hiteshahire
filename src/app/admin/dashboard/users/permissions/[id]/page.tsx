"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from '../../../lib/swalHelper';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import PageHeader from "../../../components/ui/PageHeader";

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
  platformId?: number;
}

interface User {
  id: number;
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  roles: {
    id: number;
    name: string;
    slug: string;
  }[];
  platforms: {
    id: number;
    name: string;
    code: string;
  }[];
}

interface Platform {
  id: number;
  name: string;
  code: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

export default function UserPermissionsPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User>({
    id: 0,
    staffId: "",
    firstName: "",
    lastName: "",
    email: "",
    fullName: "",
    roles: [],
    platforms: [],
  });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<number | 'all'>('all');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResource, setSelectedResource] = useState<string>("all");
  const [showSensitive, setShowSensitive] = useState(false);
  const [showSource, setShowSource] = useState<'all' | 'role' | 'user'>('all');

  // Fetch user details, platforms, and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        // Fetch user details
        const userRes = await fetch(`${API_URL}/permissions/user/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData: ApiResponse<User> = await userRes.json();
        
        if (!userRes.ok || !userData.success) {
          throw new Error(userData.message || "Failed to load user");
        }
        const userDetail = await fetch(`${API_URL}/staff/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userDataDetail: ApiResponse<User> = await userDetail.json();
        
        if (!userDetail.ok || !userDataDetail.success) {
          throw new Error(userDataDetail.message || "Failed to load user");
        }
        console.log("User data:", userDataDetail.data.firstName, userDataDetail.data.lastName);
        setUser({
          ...userData.data,
          email: userDataDetail.data.email,
          fullName: `${userDataDetail.data.firstName} ${userDataDetail.data.lastName}`,
          roles: userDataDetail.data.roles ?? [],
          platforms: userDataDetail.data.platforms ?? [],
        });


        // Fetch platforms
        const platformsRes = await fetch(`${API_URL}/permissions/user/platforms/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const platformsData: ApiResponse<Platform[]> = await platformsRes.json();
        
        if (platformsRes.ok && platformsData.success) {
          setPlatforms(platformsData.data ?? []);
        }

        // Fetch user permissions (initially with first platform or all)
        await fetchUserPermissions(parseInt(userId), 'all');
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, router]);

  // Fetch user permissions when platform changes
  const fetchUserPermissions = async (uid: number, platformId: number | 'all') => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const url = platformId === 'all'
        ? `${API_URL}/permissions/user/${uid}`
        : `${API_URL}/permissions/user/${uid}?platformId=${platformId}`;
      
      const permissionsRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const permissionsData: ApiResponse<Permission[]> = await permissionsRes.json();
      
      if (permissionsRes.ok && permissionsData.success) {
        setPermissions(permissionsData.data ?? []);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
    }
  };

  // Handle platform change
  const handlePlatformChange = (platformId: number | 'all') => {
    setSelectedPlatform(platformId);
    fetchUserPermissions(parseInt(userId), platformId);
  };

  // Toggle user-specific permission
  const toggleUserPermission = (permissionId: number, currentState: boolean) => {
    setPermissions(prev => 
      prev.map(p => 
        p.id === permissionId 
          ? { 
              ...p, 
              isGranted: !currentState,
              grantedBy: !currentState ? 'user' : (p.grantedBy === 'user' ? null : p.grantedBy)
            }
          : p
      )
    );
  };

  // Grant all permissions in resource (user override)
  const grantResourcePermissions = (resource: string) => {
    setPermissions(prev => 
      prev.map(p => 
        p.resource === resource
          ? { ...p, isGranted: true, grantedBy: 'user' }
          : p
      )
    );
  };

  // Revoke all permissions in resource (user override)
  const revokeResourcePermissions = (resource: string) => {
    setPermissions(prev => 
      prev.map(p => 
        p.resource === resource
          ? { ...p, isGranted: false, grantedBy: p.grantedBy === 'role' ? 'role' : null }
          : p
      )
    );
  };

  // Reset to role-based permissions for resource
  const resetResourceToRole = (resource: string) => {
    setPermissions(prev => 
      prev.map(p => 
        p.resource === resource
          ? { ...p, isGranted: p.grantedBy === 'role', grantedBy: p.grantedBy === 'role' ? 'role' : null }
          : p
      )
    );
  };

  // Save user permissions
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const accessToken = localStorage.getItem("access_token");

      // Separate granted and denied permissions
      const grantedPermissionIds = permissions
        .filter(p => p.isGranted && p.grantedBy === 'user')
        .map(p => p.id);

      const deniedPermissionIds = permissions
        .filter(p => !p.isGranted && p.grantedBy === 'user')
        .map(p => p.id);

      const platformId = selectedPlatform === 'all' 
        ? (platforms[0]?.id || 1) 
        : selectedPlatform;

      const response = await fetch(`${API_URL}/permissions/user/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          platformId: platformId,
          grantedPermissionIds,
          deniedPermissionIds,
        }),
      });

      const result: ApiResponse<Permission[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save permissions");
      }

      setSuccess("Permissions saved successfully!");
      
      // Refresh permissions
      setPermissions(result.data);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      await showSuccess("Branding record created successfully");
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
    .map(([resource, perms]) => {
      // Resource filter
      if (selectedResource !== "all" && resource !== selectedResource) {
        return null;
      }
    
      const filteredPerms = perms.filter((p) => {
        // Search filter
        const matchesSearch =
          searchTerm === "" ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
        // Sensitive filter
        const matchesSensitive = !showSensitive || p.isSensitive;
      
        // Source filter
        const matchesSource =
          showSource === "all"
            ? true
            : showSource === "role"
            ? p.grantedBy === "role"
            : p.grantedBy === "user";
      
        return matchesSearch && matchesSensitive && matchesSource;
      });
    
      if (filteredPerms.length === 0) return null;
    
      return {
        resource,
        permissions: filteredPerms,
      };
    })
    .filter(Boolean) as { resource: string; permissions: Permission[] }[];


  // Calculate stats
  const totalPermissions = permissions.length;
  const roleGrantedCount = permissions.filter(p => p.grantedBy === 'role').length;
  const userGrantedCount = permissions.filter(p => p.grantedBy === 'user' && p.isGranted).length;
  const userDeniedCount = permissions.filter(p => p.grantedBy === 'user' && !p.isGranted).length;
  const sensitiveCount = permissions.filter(p => p.isSensitive).length;

  // Get unique resources for filter
  const resources = Object.keys(groupedPermissions);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user permissions...</p>
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
              { label: 'Permissions' },
            ]}
          />
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                User Permissions
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                User: <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {user?.fullName} ({user?.email})
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/users"
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
        title="User Permissions"
        // description={`User: ${user?.fullName} (${user?.email})`}
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Staff", href: "/admin/dashboard/users" },
          { label: "Permissions" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/users",
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

      {/* Success Message */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* User Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">User Roles</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(user?.roles ?? []).map(role => (
                  <span key={role.id} className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">User Platforms</p>
              {/* <div className="flex flex-wrap gap-1 mt-1">
                {(user?.platforms ?? []).map(platform => (
                  <span key={platform.id} className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {platform.name}
                  </span>
                ))}
              </div> */}
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {(user?.platforms ?? []).length} Platforms
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => handlePlatformChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {/* <option value="all">All Platforms (Combined)</option> */}
                {platforms.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPermissions}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">Role Granted</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{roleGrantedCount}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">User Granted</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userGrantedCount}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">User Denied</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{userDeniedCount}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sensitive</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{sensitiveCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
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

          {/* Source Filter */}
          <select
            value={showSource}
            onChange={(e) => setShowSource(e.target.value as 'all' | 'role' | 'user')}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Sources</option>
            <option value="role">Role-based only</option>
            <option value="user">User overrides only</option>
          </select>

          {/* Sensitive Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSensitive}
              onChange={(e) => setShowSensitive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show sensitive only</span>
          </label>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedResource("all");
              setShowSensitive(false);
              setShowSource("all");
            }}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="space-y-6">
        {filteredResources.map(({ resource, permissions: resourcePerms }) => {
          const allGrantedByRole = resourcePerms.every(p => p.grantedBy === 'role' && p.isGranted);
          const hasUserOverrides = resourcePerms.some(p => p.grantedBy === 'user');
          const allUserGranted = resourcePerms.every(p => p.grantedBy === 'user' && p.isGranted);
          const allUserDenied = resourcePerms.every(p => p.grantedBy === 'user' && !p.isGranted);

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
                    {hasUserOverrides && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Has overrides
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => grantResourcePermissions(resource)}
                      className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      title="Grant all (user override)"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Grant All
                    </button>
                    <button
                      onClick={() => revokeResourcePermissions(resource)}
                      className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      title="Revoke all (user override)"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                      Revoke All
                    </button>
                    <button
                      onClick={() => resetResourceToRole(resource)}
                      className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                      title="Reset to role-based"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(resourcePerms ?? []).map(permission => {
                  const isRoleGranted = permission.grantedBy === 'role' && permission.isGranted;
                  const isUserGranted = permission.grantedBy === 'user' && permission.isGranted;
                  const isUserDenied = permission.grantedBy === 'user' && !permission.isGranted;

                  return (
                    <div
                      key={permission.id}
                      className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        permission.isSensitive ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
                      } ${
                        isUserGranted ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      } ${
                        isUserDenied ? 'bg-red-50/50 dark:bg-red-900/10' : ''
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
                          {isRoleGranted && (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Role-based
                            </span>
                          )}
                          {isUserGranted && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              User Granted
                            </span>
                          )}
                          {isUserDenied && (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              User Denied
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => toggleUserPermission(permission.id, permission.isGranted)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          permission.isGranted 
                            ? isUserGranted 
                              ? 'bg-blue-600' 
                              : 'bg-green-600'
                            : isUserDenied
                            ? 'bg-red-600'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        title={isUserGranted ? 'User granted - click to remove override' : 
                               isUserDenied ? 'User denied - click to remove override' :
                               'Click to add user override'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                            permission.isGranted ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
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
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium text-green-600 dark:text-green-400">{userGrantedCount}</span>
                <span className="text-gray-500 dark:text-gray-400"> granted</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-red-600 dark:text-red-400">{userDeniedCount}</span>
                <span className="text-gray-500 dark:text-gray-400"> denied</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{roleGrantedCount}</span>
                <span className="text-gray-500 dark:text-gray-400"> role-based</span>
              </div>
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
                'Save User Overrides'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
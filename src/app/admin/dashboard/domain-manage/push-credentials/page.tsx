// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\push-credentials\page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Bell,
  Database,
  Key,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { showSuccess, showError } from "../../lib/swalHelper";

interface PushCredential {
  id: number;
  platformId: number;
  credentialName: string;
  firebaseProjectId: string;
  firebaseServerKey: string;
  firebaseAppId: string | null;
  vapidKey: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: PushCredential[];
    meta: PaginationMeta;
  };
  timestamp: string;
  path: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function PushCredentialsIndex() {
  const [credentials, setCredentials] = useState<PushCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const limit = 10;

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);

  const fetchCredentials = useCallback(async () => {
    if (!selectedPlatformId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showError("Authentication required");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(
        `${API_URL}/platforms/push-credentials/${selectedPlatformId}?${params}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          showError("Session expired. Please login again.");
          return;
        }
        throw new Error("Failed to fetch credentials");
      }

      const json: ApiResponse = await res.json();
      setCredentials(json.data.data || []);
      setTotalPages(json.data.meta.totalPages || 1);
      setTotal(json.data.meta.total || 0);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      showError("Failed to load push credentials");
      setCredentials([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedPlatformId, currentPage, searchTerm, API_URL]);

  useEffect(() => {
    if (selectedPlatformId) {
      fetchCredentials();
    }
  }, [fetchCredentials, selectedPlatformId]);

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showError("Authentication required");
        return;
      }

      const res = await fetch(
        `${API_URL}/platforms/push-credentials/${selectedId}`,
        { 
          method: "DELETE", 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      await showSuccess("Push credential deleted successfully");
      setDeleteModalOpen(false);
      setSelectedId(null);
      fetchCredentials();
    } catch (error) {
      console.error("Error deleting credential:", error);
      showError("Failed to delete credential");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selectedPlatformId) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
            No Platform Selected
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please select a platform from the dashboard to manage push credentials.
          </p>
        </div>
      </div>
    );
  }

  if (loading && credentials.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading push credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
              { label: "Push Credentials" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Push Notification Credentials
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage Firebase Cloud Messaging credentials for push notifications
          </p>
        </div>
        {hasPermission("push-credentials", "create") && (
          <Link
            href="/admin/dashboard/domain-manage/push-credentials/create"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-md"
          >
            <Plus className="h-5 w-5" />
            Add Credential
          </Link>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name or project ID..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-3">
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => fetchCredentials()}
              className="flex items-center gap-2 rounded-lg bg-purple-100 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {credentials.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                No push credentials found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try a different search term"
                  : "Add your first Firebase Cloud Messaging credential"}
              </p>
              {hasPermission("push-credentials", "create") && !searchTerm && (
                <div className="mt-6">
                  <Link
                    href="/admin/dashboard/domain-manage/push-credentials/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Credential
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Credential Name
                    </th>
                    {/* <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Firebase Project ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Server Key
                    </th> */}
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Created
                    </th>
                    {(hasPermission("push-credentials", "view") ||
                      hasPermission("push-credentials", "edit") ||
                      hasPermission("push-credentials", "delete")) && (
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {credentials.map((cred) => (
                    <tr
                      key={cred.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {cred.credentialName}
                            </p>
                            {cred.firebaseAppId && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                App ID: {truncateText(cred.firebaseAppId, 20)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {cred.firebaseProjectId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                            {truncateText(cred.firebaseServerKey, 25)}
                          </span>
                        </div>
                      </td> */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            cred.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {cred.isActive ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {cred.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(cred.createdAt)}
                      </td>
                      {(hasPermission("push-credentials", "view") ||
                        hasPermission("push-credentials", "edit") ||
                        hasPermission("push-credentials", "delete")) && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {hasPermission("push-credentials", "view") && (
                              <Link
                                href={`/admin/dashboard/domain-manage/push-credentials/view/${cred.id}`}
                                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission("push-credentials", "edit") && (
                              <Link
                                href={`/admin/dashboard/domain-manage/push-credentials/edit/${cred.id}`}
                                className="rounded-lg bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission("push-credentials", "delete") && (
                              <button
                                onClick={() => {
                                  setSelectedId(cred.id);
                                  setDeleteModalOpen(true);
                                }}
                                className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-6 py-4 dark:border-gray-700 sm:flex-row">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * limit, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) page = i + 1;
                      else if (currentPage >= totalPages - 2)
                        page = totalPages - 4 + i;
                      else page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
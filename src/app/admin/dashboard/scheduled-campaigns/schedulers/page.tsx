"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { showSuccess, showError } from "../../lib/swalHelper";
import PageHeader from "../../components/ui/PageHeader";

interface Scheduler {
  id: number;
  platformId: number;
  name: string;
  scheduleTime: string | null;
  scheduleDate: string | null;
  scheduleFromDate: string | null;
  scheduleToDate: string | null;
  afterRegistrationMin: string | null;
  afterApprovalMin: string | null;
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
    data: Scheduler[];
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

interface Stats {
  total: number;
  active: number;
  scheduledToday: number;
}

export default function SchedulersIndex() {
  const [schedulers, setSchedulers] = useState<Scheduler[]>([]);
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
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, scheduledToday: 0 });

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const limit = 10;

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);

  const fetchStats = useCallback(async () => {
    if (!selectedPlatformId) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/scheduled-campaigns/schedulers/stats/${selectedPlatformId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        // console.log("Stats data:", data.data);
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [selectedPlatformId, API_URL]);

  const fetchSchedulers = useCallback(async () => {
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
        `${API_URL}/scheduled-campaigns/schedulers/${selectedPlatformId}?${params}`,
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
        throw new Error("Failed to fetch schedulers");
      }

      const json: ApiResponse = await res.json();
      setSchedulers(json.data.data || []);
      setTotalPages(json.data.meta.totalPages || 1);
      setTotal(json.data.meta.total || 0);
    } catch (error) {
      console.error("Error fetching schedulers:", error);
      showError("Failed to load schedulers");
      setSchedulers([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedPlatformId, currentPage, searchTerm, API_URL]);

  useEffect(() => {
    if (selectedPlatformId) {
      fetchSchedulers();
      fetchStats();
    }
  }, [fetchSchedulers, fetchStats, selectedPlatformId]);

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
        `${API_URL}/scheduled-campaigns/schedulers/${selectedId}`,
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

      await showSuccess("Scheduler deleted successfully");
      setDeleteModalOpen(false);
      setSelectedId(null);
      fetchSchedulers();
      fetchStats();
    } catch (error) {
      console.error("Error deleting scheduler:", error);
      showError("Failed to delete scheduler");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
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

  const getScheduleType = (scheduler: Scheduler): string => {
    if (scheduler.scheduleTime && scheduler.scheduleDate) return "Specific Date & Time";
    if (scheduler.scheduleTime) return "Daily at " + scheduler.scheduleTime;
    if (scheduler.scheduleDate) return "On " + formatDate(scheduler.scheduleDate);
    if (scheduler.scheduleFromDate && scheduler.scheduleToDate) 
      return `${formatDate(scheduler.scheduleFromDate)} - ${formatDate(scheduler.scheduleToDate)}`;
    if (scheduler.afterRegistrationMin) return `${scheduler.afterRegistrationMin} min after registration`;
    if (scheduler.afterApprovalMin) return `${scheduler.afterApprovalMin} min after approval`;
    return "Manual";
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
            Please select a platform from the dashboard to manage schedulers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Campaign Schedulers"
        // description="Configure scheduling rules for automated campaigns"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Schedulers" },
        ]}
        createButton={{
          href: "/admin/dashboard/scheduled-campaigns/schedulers/create",
          label: "Create Scheduler",
          permission: { resource: "schedulers", action: "create" }
        }}
        permissions={permissions}   // ← Pass here
      />

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Schedulers</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Schedulers</p>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Today</p>
              <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.scheduledToday}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name..."
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
              onClick={() => fetchSchedulers()}
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
        {loading && schedulers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading schedulers...</p>
            </div>
          </div>
        ) : schedulers.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                No schedulers found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try a different search term"
                  : "Create your first scheduler to automate campaigns"}
              </p>
              {hasPermission("schedulers", "create") && !searchTerm && (
                <div className="mt-6">
                  <Link
                    href="/admin/dashboard/scheduled-campaigns/schedulers/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Scheduler
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
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Schedule Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Created
                    </th>
                    {(hasPermission("schedulers", "view") ||
                      hasPermission("schedulers", "edit") ||
                      hasPermission("schedulers", "delete")) && (
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {schedulers.map((scheduler) => (
                    <tr
                      key={scheduler.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {scheduler.name}
                            </p>
                            {scheduler.scheduleTime && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Time: {scheduler.scheduleTime}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          <Clock className="h-3 w-3" />
                          {getScheduleType(scheduler)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            scheduler.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {scheduler.isActive ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {scheduler.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(scheduler.createdAt)}
                      </td>
                      {(hasPermission("schedulers", "view") ||
                        hasPermission("schedulers", "edit") ||
                        hasPermission("schedulers", "delete")) && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {hasPermission("schedulers", "view") && (
                              <Link
                                href={`/admin/dashboard/scheduled-campaigns/schedulers/view/${scheduler.id}`}
                                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission("schedulers", "edit") && (
                              <Link
                                href={`/admin/dashboard/scheduled-campaigns/schedulers/edit/${scheduler.id}`}
                                className="rounded-lg bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission("schedulers", "delete") && (
                              <button
                                onClick={() => {
                                  setSelectedId(scheduler.id);
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
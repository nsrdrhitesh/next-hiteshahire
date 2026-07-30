// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\whatsapp-messages\page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Calendar,
  Users
} from "lucide-react";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { showSuccess, showError } from "../../lib/swalHelper";
import PageHeader from '../../components/ui/PageHeader';

interface WhatsAppMessage {
  id: number;
  platformId: number;
  name: string;
  templateUrl: string | null;
  variables: string[] | null;
  schedulerId: number;
  conditionId: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  resource: string;
  action: string;
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
    data: WhatsAppMessage[];
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
}

export default function WhatsAppMessagesIndex() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
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
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0 });

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
        `${API_URL}/scheduled-campaigns/whatsapp-messages/stats/${selectedPlatformId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        console.log("Okay data -- ",data.data);
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [selectedPlatformId, API_URL]);

  const fetchMessages = useCallback(async () => {
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
        `${API_URL}/scheduled-campaigns/whatsapp-messages/${selectedPlatformId}?${params}`,
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
        throw new Error("Failed to fetch messages");
      }

      const json: ApiResponse = await res.json();
      setMessages(json.data.data || []);
      setTotalPages(json.data.meta.totalPages || 1);
      setTotal(json.data.meta.total || 0);
    } catch (error) {
      console.error("Error fetching messages:", error);
      showError("Failed to load WhatsApp messages");
      setMessages([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedPlatformId, currentPage, searchTerm, API_URL]);

  useEffect(() => {
    if (selectedPlatformId) {
      fetchMessages();
      fetchStats();
    }
  }, [fetchMessages, fetchStats, selectedPlatformId]);

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
        `${API_URL}/scheduled-campaigns/whatsapp-messages/${selectedId}`,
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

      await showSuccess("WhatsApp message deleted successfully");
      setDeleteModalOpen(false);
      setSelectedId(null);
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error("Error deleting message:", error);
      showError("Failed to delete message");
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
            Please select a platform from the dashboard to manage WhatsApp messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="WhatsApp Message Templates"
        // description="Manage WhatsApp message templates for automated campaigns"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "WhatsApp Messages" },
        ]}
        createButton={{
          href: "/admin/dashboard/scheduled-campaigns/whatsapp-messages/create",
          label: "Create Message",
          permission: { resource: "whatsapp-messages", action: "create" }
        }}
        permissions={permissions}   // ← Pass here
      />

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Messages</p>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
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
              onClick={() => fetchMessages()}
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
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                No WhatsApp messages found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try a different search term"
                  : "Create your first WhatsApp message template"}
              </p>
              {hasPermission("whatsapp-messages", "create") && !searchTerm && (
                <div className="mt-6">
                  <Link
                    href="/admin/dashboard/scheduled-campaigns/whatsapp-messages/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Message
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
                      Template URL
                    </th>
                    {/* <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Variables
                    </th> */}
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Created
                    </th>
                    {(hasPermission("whatsapp-messages", "view") ||
                      hasPermission("whatsapp-messages", "edit") ||
                      hasPermission("whatsapp-messages", "delete")) && (
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map((message) => (
                    <tr
                      key={message.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                            <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {message.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Scheduler ID: {message.schedulerId} | Condition ID: {message.conditionId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {message.templateUrl ? (
                          <a
                            href={message.templateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:underline dark:text-purple-400"
                          >
                            View Template
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      {/* <td className="px-6 py-4">
                        {message.variables && message.variables.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {message.variables.slice(0, 3).map((variable, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                              >
                                {`{{${variable}}}`}
                              </span>
                            ))}
                            {message.variables.length > 3 && (
                              <span className="text-xs text-gray-500">+{message.variables.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No variables</span>
                        )}
                      </td> */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            message.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {message.isActive ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {message.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(message.createdAt)}
                      </td>
                      {(hasPermission("whatsapp-messages", "view") ||
                        hasPermission("whatsapp-messages", "edit") ||
                        hasPermission("whatsapp-messages", "delete")) && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {hasPermission("whatsapp-messages", "view") && (
                              <Link
                                href={`/admin/dashboard/scheduled-campaigns/whatsapp-messages/view/${message.id}`}
                                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission("whatsapp-messages", "edit") && (
                              <Link
                                href={`/admin/dashboard/scheduled-campaigns/whatsapp-messages/edit/${message.id}`}
                                className="rounded-lg bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            {hasPermission("whatsapp-messages", "delete") && (
                              <button
                                onClick={() => {
                                  setSelectedId(message.id);
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
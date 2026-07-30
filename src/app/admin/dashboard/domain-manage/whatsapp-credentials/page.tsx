// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\scheduled-campaigns\whatsapp\credentials\page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Phone,
  MessageSquare,
  Key,
  X
} from "lucide-react";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { showSuccess, showError } from "../../lib/swalHelper";

interface WhatsAppCredential {
  id: number;
  platformId: number;
  credentialName: string;
  phoneNumber: string;
  phoneNumberId: string;
  whatsappBusinessAccountId: string;
  templateNamespace: string | null;
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
    data: WhatsAppCredential[];
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

export default function WhatsAppCredentialsIndex() {
  const [credentials, setCredentials] = useState<WhatsAppCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const limit = 10;

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    fetchCredentials();
  }, [currentPage, searchTerm]);

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const selectedPlatformId = localStorage.getItem("selected_platform_id");

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(
        `${API_URL}/platforms/whatsapp-credentials/${selectedPlatformId}?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch credentials");

      const json: ApiResponse = await res.json();
      setCredentials(json.data.data);
      setTotalPages(json.data.meta.totalPages);
      setTotal(json.data.meta.total);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      showError("Failed to load WhatsApp credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/platforms/whatsapp-credentials/${selectedId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Delete failed");

      await showSuccess("WhatsApp credential deleted successfully");
      fetchCredentials();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting credential:", error);
      showError("Failed to delete credential");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading credentials...</p>
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
              { label: "WhatsApp Credentials" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            WhatsApp Business Credentials
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage WhatsApp Business API credentials for your platform
          </p>
        </div>
        {hasPermission("whatsapp-credentials", "create") && (
          <Link
            href="/admin/dashboard/domain-manage/whatsapp-credentials/create"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-md"
          >
            <Plus className="h-5 w-5" />
            Add Credential
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or phone number..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSearchTerm("")}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Business Account ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Created
                </th>
                {(hasPermission("whatsapp-credentials", "view") ||
                  hasPermission("whatsapp-credentials", "edit") ||
                  hasPermission("whatsapp-credentials", "delete")) && (
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {credentials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                        No WhatsApp credentials found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm
                          ? "Try a different search term"
                          : "Add your first WhatsApp Business credential"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                credentials.map((cred) => (
                  <tr
                    key={cred.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                          <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {cred.credentialName}
                          </p>
                          {cred.templateNamespace && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Namespace: {cred.templateNamespace}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {cred.phoneNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                        {cred.whatsappBusinessAccountId.substring(0, 15)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          cred.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {cred.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(cred.createdAt)}
                    </td>
                    {(hasPermission("whatsapp-credentials", "view") ||
                      hasPermission("whatsapp-credentials", "edit") ||
                      hasPermission("whatsapp-credentials", "delete")) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {hasPermission("whatsapp-credentials", "view") && (
                            <Link
                              href={`/admin/dashboard/domain-manage/whatsapp-credentials/view/${cred.id}`}
                              className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}
                          {hasPermission("whatsapp-credentials", "edit") && (
                            <Link
                              href={`/admin/dashboard/domain-manage/whatsapp-credentials/edit/${cred.id}`}
                              className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          {hasPermission("whatsapp-credentials", "delete") && (
                            <button
                              onClick={() => {
                                setSelectedId(cred.id);
                                setDeleteModalOpen(true);
                              }}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * limit, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      currentPage === page
                        ? "bg-purple-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { showSuccess, showError } from '../../lib/swalHelper';

interface DomainSocialAccount {
  id: number;
  platform_id: number;
  account_url: string;
  icon_class: string | null;
  display_order: number;
  status: number; // 1=Active, 2=Inactive
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

interface ApiResponse<T> {
  success: boolean;
  data: PaginatedData<T>;
  timestamp: string;
  path: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

interface Props {
  searchTerm: string;
}

export default function DomainSocialAccountsTable({ searchTerm }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [accounts, setAccounts] = useState<DomainSocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const limit = 10;

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
  }, []);

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(`${API_URL}/domain/social-accounts/${selectedPlatformId}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch social accounts");

        const json: ApiResponse<DomainSocialAccount> = await res.json();

        setAccounts(json.data.data);
        setTotalPages(json.data.meta.totalPages);
        setTotal(json.data.meta.total);
        setCurrentPage(json.data.meta.page);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, API_URL]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      
      const res = await fetch(`${API_URL}/domain/social-accounts/${selectedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchData(currentPage);
      setIsDeleteModalOpen(false);
      await showSuccess("Branding record created successfully");
    } catch (err: any) {
      console.error(err);
      showError(err.message);
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

  const getStatusBadge = (status: number) => {
    if (status === 1)
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Active
        </span>
      );
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading social accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
            <tr>
              {/* <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Platform ID
              </th> */}
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Account URL
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Icon
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Order
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              {/* <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Created
              </th> */}
              {(hasPermission("domain-social-accounts", "view") ||
                hasPermission("domain-social-accounts", "edit") ||
                hasPermission("domain-social-accounts", "delete")) && (
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                      No social accounts found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? "Try a different search term" : "Add your first social account link."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {/* <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {acc.platform_id}
                  </td> */}
                  <td className="px-6 py-4">
                    <a
                      href={acc.account_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {acc.account_url.length > 30
                        ? acc.account_url.substring(0, 57) + "..."
                        : acc.account_url}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    {acc.icon_class ? (
                      <i className={`${acc.icon_class} text-xl text-gray-700 dark:text-gray-300`}></i>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {acc.display_order}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(acc.status)}</td>
                  {/* <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(acc.created_at)}
                  </td> */}
                  {(hasPermission("domain-social-accounts", "view") ||
                    hasPermission("domain-social-accounts", "edit") ||
                    hasPermission("domain-social-accounts", "delete")) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {hasPermission("domain-social-accounts", "view") && (
                          <Link
                            href={`/admin/dashboard/domain-manage/social-accounts/view/${acc.id}`}
                            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Link>
                        )}
                        {hasPermission("domain-social-accounts", "edit") && (
                          <Link
                            href={`/admin/dashboard/domain-manage/social-accounts/edit/${acc.id}`}
                            className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                        )}
                        {hasPermission("domain-social-accounts", "delete") && (
                          <button
                            onClick={() => {
                              setSelectedId(acc.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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
            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * limit, total)}</span> of{" "}
            <span className="font-medium">{total}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => fetchData(page)}
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
              onClick={() => fetchData(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
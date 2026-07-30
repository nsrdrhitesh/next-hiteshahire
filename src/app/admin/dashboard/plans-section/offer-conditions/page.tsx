"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import PageHeader from "../../components/ui/PageHeader";

interface OfferCondition {
  id: number;
  platformId: number;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  gender: number[] | null;
  city: number[] | null;
  state: number[] | null;
  country: number[] | null;
  annualIncome: number | null;
  wealth: number | null;
  nri: number;
  applicablePlanIds: number[] | null;
  applicableDiscountIds: number[] | null;
  applicableDeviceCodes: number[] | null;
  conditionShortOrder: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function OfferConditionsPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  
  const [conditions, setConditions] = useState<OfferCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalConditions, setTotalConditions] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedConditionId, setSelectedConditionId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const itemsPerPage = 10;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const statuses = [
    { id: "all", name: "All Status" },
    { id: "1", name: "Active Conditions" },
    { id: "0", name: "Inactive Conditions" },
  ];

  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
    if (storedPermissions) {
      setPermissions(JSON.parse(storedPermissions));
    }
  }, []);

  const hasPermission = (resource: string, action: string) => {
    return permissions.some(
      (permission) => permission.resource === resource && permission.action === action
    );
  };

  const fetchConditions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        platformId: platformId.toString(),
      });

      if (searchTerm && searchTerm.trim() !== "") {
        params.append("search", searchTerm);
      }
      if (selectedStatus !== "all") {
        params.append("isActive", selectedStatus === "1" ? "true" : "false");
      }

      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/offer-conditions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConditions(data.data.data);
        setTotalPages(data.data.meta.totalPages);
        setTotalConditions(data.data.meta.total);
      } else {
        throw new Error("Failed to fetch conditions");
      }
    } catch (error) {
      console.error("Error fetching conditions:", error);
      showError("Failed to load conditions");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedStatus, platformId, API_URL]);

  useEffect(() => {
    fetchConditions();
  }, [fetchConditions]);

  const handleDeleteClick = (id: number) => {
    setSelectedConditionId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConditionId) return;

    try {
      setDeleteLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/offer-conditions/${selectedConditionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete");

      await showSuccess("Condition deleted successfully");
      fetchConditions();
      setIsDeleteModalOpen(false);
      setSelectedConditionId(null);
    } catch (error) {
      console.error("Delete error:", error);
      showError("Failed to delete condition");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (isActive: number) => {
    return isActive === 1 ? (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-300">
        Active
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-300">
        Inactive
      </span>
    );
  };

  const formatAgeRange = (min: number | null, max: number | null) => {
    if (min && max) return `${min} - ${max} years`;
    if (min) return `${min}+ years`;
    if (max) return `Up to ${max} years`;
    return "Any age";
  };

  const formatList = (items: number[] | null) => {
    if (!items || items.length === 0) return "Any";
    if (items.length === 1) return `${items[0]}`;
    return `${items[0]} +${items.length - 1} more`;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "Any";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalConditions);

  if (loading && conditions.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conditions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offer Conditions Management"
        // description="Control eligibility rules and conditions for offers and discounts"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Section", href: "/admin/dashboard/plans-section" },
          { label: "Offer Conditions" },
        ]}
        createButton={{
          href: "/admin/dashboard/plans-section/offer-conditions/create",
          label: "Create New Condition",
          permission: { resource: "offer-conditions", action: "create" }
        }}
        permissions={permissions}
      />

      {/* Filters Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="relative max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conditions by name..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("all");
                setCurrentPage(1);
              }}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Conditions Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Condition Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Age Range</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Gender</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Income/Wealth</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Sort Order</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {conditions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No conditions found</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new condition.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                conditions.map((condition) => (
                  <tr key={condition.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{condition.name}</h3>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{formatAgeRange(condition.minAge, condition.maxAge)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{formatList(condition.gender)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {condition.annualIncome && <div>Income: {formatCurrency(condition.annualIncome)}+</div>}
                        {condition.wealth && <div>Wealth: {formatCurrency(condition.wealth)}+</div>}
                        {!condition.annualIncome && !condition.wealth && <span>Any</span>}
                        {condition.nri === 1 && <div className="text-xs text-purple-600 dark:text-purple-400">NRI Only</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{condition.conditionShortOrder}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(condition.isActive)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/dashboard/plans-section/offer-conditions/view/${condition.id}`}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title="View condition"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/dashboard/plans-section/offer-conditions/edit/${condition.id}`}
                          className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          title="Edit condition"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(condition.id)}
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          title="Delete condition"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {conditions.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Showing <span className="font-medium">{startIndex}</span> to{" "}
              <span className="font-medium">{endIndex}</span> of{" "}
              <span className="font-medium">{totalConditions}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-purple-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import PageHeader from "../../components/ui/PageHeader";

interface PlanOffer {
  id: number;
  platformId: number;
  planId: number;
  planName?: string;
  name: string;
  description: string;
  discountType: number;
  discountValue: number;
  applicableDurationIds: number[];
  applicableDeviceCodes: number[] | null;
  startDate: string | null;
  endDate: string | null;
  conflictHandleDiscount: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function PlanOffersPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  
  const [offers, setOffers] = useState<PlanOffer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDiscountType, setSelectedDiscountType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOffers, setTotalOffers] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const itemsPerPage = 10;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const statuses = [
    { id: "all", name: "All Status" },
    { id: "1", name: "Active Offers" },
    { id: "0", name: "Inactive Offers" },
  ];

  const discountTypes = [
    { id: "all", name: "All Types" },
    { id: "1", name: "Percentage Discount" },
    { id: "2", name: "Fixed Amount Discount" },
  ];

  const conflictHandleMap: Record<number, string> = {
    1: "Highest",
    2: "Lowest",
    3: "Newest",
    4: "Oldest",
    5: "Stack",
  };

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

  // Fetch plans for filter dropdown
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/plans?platformId=${platformId}&limit=100`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPlans(data.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
    fetchPlans();
  }, [API_URL, platformId]);

  const fetchOffers = useCallback(async () => {
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
      if (selectedPlanId !== "all") {
        params.append("planId", selectedPlanId);
      }
      if (selectedStatus !== "all") {
        params.append("isActive", selectedStatus === "1" ? "true" : "false");
      }
      if (selectedDiscountType !== "all") {
        params.append("discountType", selectedDiscountType);
      }

      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/plan-offers?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const enrichedOffers = data.data.data.map((offer: PlanOffer) => ({
          ...offer,
          planName: plans.find(p => p.id === offer.planId)?.name || `Plan #${offer.planId}`,
        }));
        setOffers(enrichedOffers);
        setTotalPages(data.data.meta.totalPages);
        setTotalOffers(data.data.meta.total);
      } else {
        throw new Error("Failed to fetch offers");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      showError("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedPlanId, selectedStatus, selectedDiscountType, platformId, plans, API_URL]);

  useEffect(() => {
    if (plans.length > 0 || selectedPlanId === "all") {
      fetchOffers();
    }
  }, [fetchOffers, plans, selectedPlanId]);

  const handleDeleteClick = (id: number) => {
    setSelectedOfferId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOfferId) return;

    try {
      setDeleteLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/plan-offers/${selectedOfferId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete");

      await showSuccess("Offer deleted successfully");
      fetchOffers();
      setIsDeleteModalOpen(false);
      setSelectedOfferId(null);
    } catch (error) {
      console.error("Delete error:", error);
      showError("Failed to delete offer");
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

  const getDiscountTypeBadge = (type: number) => {
    return type === 1 ? (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        Percentage
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        Fixed Amount
      </span>
    );
  };

  const formatDiscount = (type: number, value: number) => {
    if (type === 1) {
      return `${value}% OFF`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No end date";
    return new Date(dateString).toLocaleDateString();
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalOffers);

  if (loading && offers.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader
        title="Plan Offers Management"
        // description="Manage discounts, promotional offers, and special deals for subscription plans"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Section", href: "/admin/dashboard/plans-section" },
          { label: "Plan Offers" },
        ]}
        createButton={{
          href: "/admin/dashboard/plans-section/plan-offers/create",
          label: "Plan Offers Management",
          permission: { resource: "plan-offers", action: "create" }
        }}
        permissions={permissions}   // ← Pass here
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
                placeholder="Search offers by name..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
            <select
              value={selectedDiscountType}
              onChange={(e) => setSelectedDiscountType(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {discountTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
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
                setSelectedPlanId("all");
                setSelectedStatus("all");
                setSelectedDiscountType("all");
                setCurrentPage(1);
              }}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Offers Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Offer Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Valid Until</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Conflict Handle</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No offers found</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new offer.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{offer.name}</h3>
                        {offer.description && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{offer.description.substring(0, 60)}...</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {offer.planName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getDiscountTypeBadge(offer.discountType)}
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatDiscount(offer.discountType, offer.discountValue)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{formatDate(offer.endDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{conflictHandleMap[offer.conflictHandleDiscount]}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(offer.isActive)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/dashboard/plans-section/plan-offers/view/${offer.id}`}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title="View offer"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/dashboard/plans-section/plan-offers/edit/${offer.id}`}
                          className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          title="Edit offer"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(offer.id)}
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          title="Delete offer"
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

        {offers.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Showing <span className="font-medium">{startIndex}</span> to{" "}
              <span className="font-medium">{endIndex}</span> of{" "}
              <span className="font-medium">{totalOffers}</span> results
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
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { showSuccess, showError } from '../../lib/swalHelper';

  //  INTERFACES

interface Staff {
  id: number;
  staffId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bio: string;
  profileImage: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: Staff[];
    meta: {
      total: number;
      totalPages: number;
      page: number;
      limit: number;
    };
  };
}

/* ================================
   COMPONENT
================================ */

interface StaffTableProps {
  searchTerm: string;
  status: string;
}

export default function StaffTable({
  searchTerm,
  status,
}: StaffTableProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const itemsPerPage = 10;

  /* ================================
     FETCH STAFF
  ================================= */

  const fetchStaff = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });

        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm);
        }

        if (status !== "all") {
          params.append("status", status);
        }

        const accessToken = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/staff?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch staff");

        const result: ApiResponse = await response.json();

        setStaff(result.data.data);
        setTotalPages(result.data.meta.totalPages);
        setTotalRecords(result.data.meta.total);
        setCurrentPage(result.data.meta.page);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, status]
  );

  useEffect(() => {
    fetchStaff(1);
  }, [fetchStaff]);

  const handleDeleteClick = (id: number) => {
    setSelectedStaffId(id);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedStaffId) return;
  
    try {
      setDeleteLoading(true);
    
      const accessToken = localStorage.getItem("access_token");
    
      const response = await fetch(
        `${API_URL}/staff/${selectedStaffId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    
      if (!response.ok) throw new Error("Failed to delete");
    
      // Refresh table after delete
      await fetchStaff(currentPage);
      setIsDeleteModalOpen(false);
      await showSuccess("Branding record created successfully");
      setSelectedStaffId(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      showError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ================================
     HELPERS
  ================================= */

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchStaff(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalRecords);

  /* ================================
     LOADING STATE
  ================================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading staff members...
          </p>
        </div>
      </div>
    );
  }

  /* ================================
     TABLE
  ================================= */

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                Staff
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              {/* <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                Joined
              </th> */}
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                Last Login
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  No staff found
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {/* STAFF INFO */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                          {member.firstName.charAt(0)}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.staffId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CONTACT */}
                  <td className="px-6 py-4 text-sm">
                    <p>{member.email}</p>
                    <p className="text-xs text-gray-500">{member.phone}</p>
                  </td>

                  {/* ROLE */}
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      {member.role}
                    </span>
                  </td>

                  {/* DEPARTMENT */}
                  <td className="px-6 py-4 capitalize text-sm">
                    {member.department}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>

                  {/* JOIN DATE */}
                  {/* <td className="px-6 py-4 text-sm">
                    {formatDate(member.joinDate)}
                  </td> */}

                  {/* LAST LOGIN */}
                  <td className="px-6 py-4 text-sm">
                    {member.lastLogin
                      ? formatDate(member.lastLogin)
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/dashboard/users/view/${member.id}`}
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/dashboard/users/edit/${member.id}`}
                        className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/dashboard/users/permissions/${member.id}`}
                        className="rounded-lg bg-purple-50 p-2 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"
                        title="Manage Permissions"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(member.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
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

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-400">
          Showing <span className="font-medium">{startIndex}</span> to{" "}
          <span className="font-medium">{endIndex}</span> of{" "}
          <span className="font-medium">{totalRecords}</span> results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            Next
          </button>
        </div>
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

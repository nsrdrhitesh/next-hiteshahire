"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { showSuccess, showError } from '../../lib/swalHelper';

interface Member {
  id: number;
  mobile_no: string;
  email: string;
  profile_for: number;
  gender: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  field_password: string;
  field_hash_password: string;
  created_at: string;
  updated_at: string;
  status?: string; // Add status field if available from your API
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
  status?: string; // Add status prop for filtering
}

export default function MemberTable({ searchTerm, status = "all" }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
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

  // Function to get member status (you can customize this based on your business logic)
  const getMemberStatus = (member: Member): string => {
    // If your API returns status, use that
    if (member.status) return member.status;
    
    // Otherwise, implement your own logic
    // Example: Check if member is active based on some criteria
    const createdDate = new Date(member.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Example status logic
    if (daysSinceCreation > 30) return "active";
    if (daysSinceCreation > 7) return "pending";
    return "new";
    
    // You can add more complex logic based on your requirements
    // For now, return a default status
    return "active";
  };

  // Get status badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "restrict":
      case "restricted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "deleted":
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "new":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }
      
      // Add status filter if needed
      if (status && status !== "all") {
        params.append("status", status);
      }
      
      const res = await fetch(`${API_URL}/member-get?${params}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch members: ${res.status}`);
      }

      const json: ApiResponse<Member> = await res.json();

      if (json.success) {
        // Filter members based on status if needed (client-side filtering)
        let filteredMembers = json.data.data;
        if (status !== "all") {
          filteredMembers = filteredMembers.filter(member => {
            const memberStatus = getMemberStatus(member);
            return memberStatus === status;
          });
        }
        
        setMembers(filteredMembers);
        setTotalPages(json.data.meta.totalPages);
        setTotal(json.data.meta.total);
        setCurrentPage(json.data.meta.page);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      showError("Failed to load members. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, status]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/member/${selectedId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) throw new Error("Failed to delete member");
      
      // Refresh the data
      fetchData(currentPage);
      setIsDeleteModalOpen(false);
      await showSuccess("Member deleted successfully");
    } catch (err: any) {
      console.error(err);
      showError(err.message || "Failed to delete member");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const getFullName = (member: Member) => {
    const parts = [member.first_name];
    if (member.middle_name) parts.push(member.middle_name);
    if (member.last_name) parts.push(member.last_name);
    return parts.join(" ");
  };

  const getGenderText = (gender: number) => {
    switch(gender) {
      case 1: return "Male";
      case 2: return "Female";
      case 3: return "Other";
      default: return "Not specified";
    }
  };

  const getProfileForText = (profileFor: number) => {
    switch(profileFor) {
      case 1: return "Self";
      case 2: return "Son";
      case 3: return "Daughter";
      case 4: return "Sibling";
      case 5: return "Friend";
      default: return "Other";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading members...</p>
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
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Member Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Contact Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Profile Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Member Status
              </th>
              {/* <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Created
              </th> */}
              {(hasPermission("admin-member", "view") ||
                hasPermission("admin-member", "edit") ||
                hasPermission("admin-member", "delete")) && (
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No members found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? "Try a different search term" : "No members have registered yet."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const memberStatus = getMemberStatus(member);
                return (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getFullName(member)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getGenderText(member.gender)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{member.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{member.mobile_no}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getProfileForText(member.profile_for)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        DOB: {formatDate(member.date_of_birth)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(memberStatus)}`}>
                        {memberStatus.toUpperCase()}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(member.created_at)}
                    </td> */}
                    {(hasPermission("admin-member", "view") ||
                      hasPermission("admin-member", "edit") ||
                      hasPermission("admin-member", "delete")) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {hasPermission("platforms", "view") && (
                            <Link
                              href={`/admin/dashboard/members/${member.id}`}
                              className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                          )}
                          {hasPermission("admin-member", "edit") && (
                            <Link
                              href={`/admin/dashboard/members/create/${member.id}/religion-form`}
                              className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                          )}
                          {hasPermission("admin-member", "delete") && (
                            <button
                              onClick={() => {
                                setSelectedId(member.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
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
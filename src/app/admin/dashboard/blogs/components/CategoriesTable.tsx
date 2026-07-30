// C:\xampp\htdocs\DMS-V2\admin\frontend\src\app\admin\dashboards\blogs\components\BlogTable.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { showSuccess, showError } from '../../lib/swalHelper';

// API Response Interface
interface ApiCategories {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: {
    data: ApiCategories[];
    meta: {
      totalPages: number;
      total: number;
      page: number;
      limit: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

// Local Categorie Interface
interface Categorie {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

interface BlogTableProps {
  searchTerm: string;
}

export default function CategoriesTable({ searchTerm }: BlogTableProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const itemsPerPage = 10;

  // Load permissions safely from localStorage
  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
    if (storedPermissions) {
      setPermissions(JSON.parse(storedPermissions));
    }
  }, []);

  const hasPermission = (resource: string, action: string) => {
    return permissions.some(
      (permission) =>
        permission.resource === resource &&
        permission.action === action
    );
  };

  // Fetch blogs from API with pagination
  const fetchBlogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      // Add filters
      if (searchTerm && searchTerm.trim() !== "") {
        params.append("search", searchTerm);
      }

      const accessToken = localStorage.getItem("access_token");
      const selectedPlatformId = localStorage.getItem("selected_platform_id");

      if (accessToken && selectedPlatformId) {
        const response = await fetch(
          `${API_URL}/blogs/categories/${selectedPlatformId}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data: ApiResponse = await response.json();

          // Transform API data
          const transformedCategories: Categorie[] = data.data.data.map(
            (apiCategory: ApiCategories) => ({
              id: apiCategory.id.toString(),
              name: apiCategory.name,
              slug: apiCategory.slug,
              description: apiCategory.description || "No description available",
              createdAt: apiCategory.createdAt,
              updatedAt: apiCategory.updatedAt,
            })
          );

          setCategories(transformedCategories);

          setTotalPages(data.data.meta.totalPages);
          setTotalCategories(data.data.meta.total);
          setCurrentPage(data.data.meta.page);
        } else {
          throw new Error("Failed to fetch categories");
        }
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      // showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, itemsPerPage]);

  // Helper function to convert statusId to status string
  const getStatusFromId = (statusId: number): "published" | "draft" | "archived" => {
    switch (statusId) {
      case 1: return "draft";
      case 2: return "published";
      case 3: return "archived";
      default: return "draft";
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch blogs on component mount and when dependencies change
  useEffect(() => {
    fetchBlogs(1); // Always start from page 1 when filters change
  }, [fetchBlogs]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchBlogs(page);
  };

  const toggleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(category => category.id));
    }
  };

  const toggleSelectCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id)
        ? prev.filter(categoryId => categoryId !== id)
        : [...prev, id]
    );
  };

  // Handle delete action
  const handleDelete = async (id: string) => {
    if (!hasPermission("blogs", "delete")) {
      alert("You don't have permission to delete blogs");
      return;
    }
    
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
          const response = await fetch(`${API_URL}/blogs/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            // Refresh the blog list
            await showSuccess("Branding record created successfully");
            fetchBlogs(currentPage);
          } else {
            throw new Error("Failed to delete blog");
          }
        }
      } catch (err: any) {
        console.error("Error deleting blog:", err);
        showError(err.message);
        // alert("Failed to delete blog");
      }
    }
  };

  // Calculate showing range
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCategories);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Slug
              </th>
              {(hasPermission("categories", "view") ||
                    hasPermission("categories", "edit") ||
                    hasPermission("categories", "delete")) && (
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No categories found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm.trim() !== ""  
                        ? "Try changing your filters or search term" 
                        : "Get started by creating a new category."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedCategories.includes(category.id) ? "bg-purple-50 dark:bg-purple-900/10" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {category.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {category.slug}
                    </span>
                  </td>
                  {(hasPermission("categories", "view") ||
                    hasPermission("categories", "edit") ||
                    hasPermission("categories", "delete")) && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* View Button - Requires "view" permission */}
                      {hasPermission("categories", "view") && (
                        <Link
                          href={`/admin/dashboard/blogs/categories/view/${category.id}`}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title="View category"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      )}

                      {/* Edit Button - Requires "edit" permission */}
                      {hasPermission("categories", "edit") && (
                        <Link
                          href={`/admin/dashboard/blogs/categories/edit/${category.id}`}
                          className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          title="Edit category"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                      )}

                      {/* Delete Button - Requires "delete" permission */}
                      {hasPermission("categories", "delete") && (
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          title="Delete category"
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
          <span className="font-medium">{totalCategories}</span> results
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
    </div>
  );
}
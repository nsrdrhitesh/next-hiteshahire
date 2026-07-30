"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { showSuccess, showError } from '../../lib/swalHelper';

// API Response Interface
interface ApiBlog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  authorId: number;
  category: {
    id: number;
    name: string;
  } | null;
  statusId: number;
  featuredImage: string | null;
  tags: string | null;
  likes: number;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: {
    data: ApiBlog[];
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

// Local Blog Interface
interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  status: "published" | "draft" | "archived";
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

interface BlogTableProps {
  searchTerm: string;
  category: string;
  status: string;
}

export default function BlogTable({ searchTerm, category, status }: BlogTableProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  
  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const itemsPerPage = 10;

  // Load permissions
  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
    if (storedPermissions) {
      setPermissions(JSON.parse(storedPermissions));
    }
  }, []);

  const hasPermission = (resource: string, action: string) => {
    return permissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action
    );
  };

  // Fetch blogs
  const fetchBlogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm?.trim()) params.append("search", searchTerm);
      if (category !== "all") params.append("categoryId", category);
      if (status !== "all") params.append("statusId", status);

      const accessToken = localStorage.getItem("access_token");
      const selectedPlatformId = localStorage.getItem("selected_platform_id");

      if (accessToken && selectedPlatformId) {
        const response = await fetch(
          `${API_URL}/blogs/${selectedPlatformId}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data: ApiResponse = await response.json();

          const transformedBlogs: Blog[] = data.data.data.map((apiBlog: ApiBlog) => ({
            id: apiBlog.id.toString(),
            title: apiBlog.title,
            excerpt: apiBlog.excerpt || "No excerpt available",
            category: apiBlog.category?.name || "Uncategorized",
            author: `Author ${apiBlog.authorId}`,
            status: getStatusFromId(apiBlog.statusId),
            views: Math.floor(Math.random() * 10000),
            likes: apiBlog.likes ?? 0,
            comments: Math.floor(Math.random() * 100),
            createdAt: formatDate(apiBlog.createdAt),
            updatedAt: formatDate(apiBlog.updatedAt),
            featured: apiBlog.publishedAt !== null,
          }));

          setBlogs(transformedBlogs);
          setTotalPages(data.data.meta.totalPages);
          setTotalBlogs(data.data.meta.total);
          setCurrentPage(data.data.meta.page);
        }
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, status, itemsPerPage]);

  const getStatusFromId = (statusId: number): "published" | "draft" | "archived" => {
    switch (statusId) {
      case 1: return "draft";
      case 2: return "published";
      case 3: return "archived";
      default: return "draft";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // === Delete Handlers ===
  const handleDeleteClick = (id: string) => {
    setSelectedBlogId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBlogId) return;

    try {
      setDeleteLoading(true);
      const accessToken = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/blogs/${selectedBlogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete blog");

      showSuccess("Blog deleted successfully");
      await fetchBlogs(currentPage); // Refresh current page
    } catch (error: any) {
      console.error("Delete error:", error);
      showError(error.message || "Failed to delete blog");
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedBlogId(null);
    }
  };

  // Fetch on mount / filter change
  useEffect(() => {
    fetchBlogs(1);
  }, [fetchBlogs]);

  const handlePageChange = (page: number) => {
    fetchBlogs(page);
  };

  const toggleSelectAll = () => {
    if (selectedBlogs.length === blogs.length) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(blogs.map(blog => blog.id));
    }
  };

  const toggleSelectBlog = (id: string) => {
    setSelectedBlogs(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: Blog["status"]) => {
    const statusConfig = {
      published: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", label: "Published" },
      draft: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", label: "Draft" },
      archived: { color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", label: "Archived" },
    };
    
    const config = statusConfig[status];
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Calculate showing range
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalBlogs);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blogs...</p>
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
                Blog Post
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Metrics
              </th>
              {(hasPermission("blogs", "view") ||
                hasPermission("blogs", "edit") ||
                hasPermission("blogs", "delete")) && (
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No blogs found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm || category !== "all" || status !== "all"
                        ? "Try changing your filters or search term"
                        : "Get started by creating a new blog post."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr
                  key={blog.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedBlogs.includes(blog.id) ? "bg-purple-50 dark:bg-purple-900/10" : ""
                  }`}
                >
                  {/* ... rest of your table row (same as before) ... */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {blog.title}
                          </h3>
                          {blog.featured && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {blog.excerpt?.length > 20 ? blog.excerpt.slice(0, 20) + "..." : blog.excerpt}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {blog.author}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {blog.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(blog.status)}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="font-medium text-gray-900 dark:text-white">{blog.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">{blog.likes.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>

                  {(hasPermission("blogs", "view") ||
                    hasPermission("blogs", "edit") ||
                    hasPermission("blogs", "delete")) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {hasPermission("blogs", "view") && (
                          <Link
                            href={`/admin/dashboard/blogs/view/${blog.id}`}
                            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        )}

                        {hasPermission("blogs", "edit") && (
                          <Link
                            href={`/admin/dashboard/blogs/edit/${blog.id}`}
                            className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        )}

                        {hasPermission("blogs", "delete") && (
                          <button
                            onClick={() => handleDeleteClick(blog.id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Same as before */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-400">
          Showing <span className="font-medium">{startIndex}</span> to{" "}
          <span className="font-medium">{endIndex}</span> of{" "}
          <span className="font-medium">{totalBlogs}</span> results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            Previous
          </button>

          {/* Page numbers logic same as before */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;

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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBlogId(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
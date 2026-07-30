"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ViewCategoryPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id;

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryDetails();
  }, []);

  const fetchCategoryDetails = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/blogs/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch category details");
      }

      const data = await response.json();
      setCategory(data);
    } catch (error) {
      console.error("Error fetching category:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch category details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error || "Category not found"}</p>
          </div>
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
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Blogs', href: '/admin/dashboard/blogs' },
              { label: 'Categories', href: '/admin/dashboard/blogs/categories' },
              { label: 'Details' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Details</h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            View detailed information about this category
          </p> */}
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/blogs/categories"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back
          </Link>
          <Link
            href={`/admin/dashboard/blogs/categories/edit/${categoryId}`}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-lg"
          >
            Edit Category
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category Name</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{category.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {category.slug}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {category.description || (
                    <span className="text-gray-400 dark:text-gray-500 italic">No description provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Metadata
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-white">{category.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(category.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(category.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Category Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Content Count</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">0</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href={`/admin/dashboard/blogs/categories/edit/${categoryId}`}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Category
              </Link>
              <Link
                href="/admin/dashboard/blogs/categories"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Categories
              </Link>
            </div>
          </div>

          {/* Usage Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Usage Information
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Category URL</h4>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300 break-all">
                      /blog/category/{category.slug}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
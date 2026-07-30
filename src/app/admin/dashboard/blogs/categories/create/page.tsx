"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from '../../../lib/swalHelper';
import { Breadcrumb } from '../../../components/ui/breadcrumb';

export default function CreateCategoryPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    platform_id: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/blogs/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }

      const data = await response.json();
      console.log("Category created:", data);

      // Redirect to categories list 
      await showSuccess("Branding record created successfully");
      router.push("/admin/dashboard/blogs/categories");
      router.refresh();
      
    } catch (err: any) {
      console.error("Error creating category:", err);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
              { label: 'Create' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Category</h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add a new category to organize your content
          </p> */}
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/blogs/categories"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="category-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter category name (e.g., Web Development)"
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Choose a descriptive name that clearly identifies the category
              </p>
            </div>

            {/* Category Slug */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Category Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="web-development"
                  required
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Generate
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                URL-friendly version of the name. Used in routes and API calls (lowercase, hyphens allowed).
              </p>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Describe what kind of content belongs in this category..."
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Provide a clear description to help users understand the category's purpose.
              </p>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Category Details
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  form="category-form"
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Category Information
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
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">About Categories</h4>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>
                        Categories help organize your content. Each category has:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>A unique name for display purposes</li>
                        <li>A URL-friendly slug for routing</li>
                        <li>An optional description for clarity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: "",
                    slug: "",
                    description: "",
                    platform_id: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
                  });
                }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Form
              </button>
              <Link
                href="/admin/dashboard/settings/categories"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
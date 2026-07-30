"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from '../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';

export default function EditCategoryPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    platform_id: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }
        const selectedPlatformId = localStorage.getItem("selected_platform_id");

        const response = await fetch(`${API_URL}/blogs/categories/${selectedPlatformId}/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch category");
        }

        const data = await response.json();
        console.log("Fetched category data:", data.data);
        setFormData({
          name: data.data.name || "",
          slug: data.data.slug || "",
          description: data.data.description || "",
          platform_id:
            data.data.platform_id ||
            parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
        });
      } catch (err) {
        setError("Failed to load category");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchCategory();
  }, [id, API_URL, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
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
      
      const response = await fetch(`${API_URL}/blogs/categories/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }
      await showSuccess("Branding record created successfully");
      router.push("/admin/dashboard/blogs/categories");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to update category");
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">
        Loading category...
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
              { label: 'Edit' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Category
          </h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update your category information
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
            {isLoading ? "Updating..." : "Update Category"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
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
                required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
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
                  required
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Category Details
            </h3>
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                form="category-form"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600"
              >
                {isLoading ? "Updating..." : "Update Category"}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Category Information
            </h3>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
              You are editing an existing category. Changes will update the
              current record.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
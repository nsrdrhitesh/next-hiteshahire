"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CategoriesTable from "../components/CategoriesTable";
import { Breadcrumb } from '../../components/ui/breadcrumb';

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function BlogsPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [categories, setCategories] = useState([
    { id: "all", name: "All Categories" },
  ]);

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

  const statuses = [
    { id: "all", name: "All Status" },
    { id: "2", name: "Published" },
    { id: "1", name: "Draft" },
    { id: "3", name: "Archived" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Blogs', href: '/admin/dashboard/blogs' },
              { label: 'Categories' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories Management</h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create, edit, and manage your categories
          </p> */}
        </div>
        <div className="flex gap-3">
          {/* Conditionally render Create button based on permission */}
          {hasPermission("categories", "create") && (
            <Link
              href="/admin/dashboard/blogs/categories/create"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Category
            </Link>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Search Bar */}
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
                placeholder="Search Category by name or slug..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Blog Table */}
      <CategoriesTable
        searchTerm={searchTerm}
      />

    </div>
  );
}
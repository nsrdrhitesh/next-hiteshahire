"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BlogTable from "./components/BlogTable";
import { Breadcrumb } from '../components/ui/breadcrumb';
import PageHeader from "../components/ui/PageHeader";

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalCategories: 0,
  });

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

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
          console.log("Okay Data Fetch here", accessToken);
          // /v1
          const selectedPlatformId = localStorage.getItem("selected_platform_id");
          const response = await fetch(`${API_URL}/blogs/stats/${selectedPlatformId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched Stats 001:", data.data.summary);
            setStats(data.data.summary);
          }else{
            throw new Error("Failed to fetch stats");
          }
        }
        // const response = await fetch("http://localhost:3003/api/v1/blogs/stats"); // You'll need to create this endpoint

      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback stats
        setStats({
          totalBlogs: 156,
          publishedBlogs: 124,
          draftBlogs: 24,
          totalCategories: 8
        });
      }
    };

    const fetchCategories = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        if (!accessToken || !selectedPlatformId) return;
      
        const response = await fetch(
          `${API_URL}/blogs/categories/${selectedPlatformId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
      
        const data = await response.json();
      
        // Prepend "All Categories"
        setCategories([
          { id: "all", name: "All Categories" },
          ...data.data.data.map((category: any) => ({
            id: category.id.toString(),
            name: category.name,
            slug: category.slug
          }))
        ]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      
        // Optional fallback
        setCategories([
          { id: "all", name: "All Categories" }
        ]);
      }
    };

    fetchStats();
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader
        title="Blog Management"
        // description="Manage discounts, promotional offers, and special deals for subscription plans"
        breadcrumbItems={[
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Blogs' },
        ]}
        createButton={{
          href: "/admin/dashboard/blogs/create",
          label: "Create New Blog",
          permission: { resource: "blogs", action: "create" }
        }}
        permissions={permissions}   // ← Pass here
      />

      {/* Stats Cards */}
      {/* Stats Cards - Updated with real data */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Blogs</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBlogs}</p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedBlogs}</p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-6 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.draftBlogs}</p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Views Total Categories</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCategories}</p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
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
                placeholder="Search blogs by title, author, or content..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>

            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              <svg className="mr-2 inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              More Filters
            </button>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Blog Table */}
      <BlogTable
        searchTerm={searchTerm}
        category={selectedCategory}
        status={selectedStatus}
      />

      {/* Bulk Actions */}
      {/* <div className="rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-6 dark:from-gray-800 dark:to-gray-900">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Bulk Actions</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Apply actions to selected blogs
            </p>
          </div>
          <div className="flex gap-3">
            <select className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <option value="">Select action...</option>
              <option value="publish">Publish Selected</option>
              <option value="draft">Move to Draft</option>
              <option value="archive">Archive Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button className="rounded-lg bg-purple-100 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50">
              Apply
            </button>
          </div>
        </div>
      </div> */}

    </div>
  );
}
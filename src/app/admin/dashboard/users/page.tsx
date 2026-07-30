"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BlogTable from "./components/UserTable";
import { showSuccess, showError } from '../lib/swalHelper';
import { Breadcrumb } from '../components/ui/breadcrumb';
import PageHeader from "../components/ui/PageHeader";

export default function AdminUserPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  });

  const portals = [
    { id: "all", name: "All Portals" },
    { id: "96k-maratha", name: "96k Maratha Matrimony" },
    { id: "jain", name: "Jain Matrimony" },
    { id: "brahmin", name: "Brahmin Matrimony" },
    { id: "gujrati", name: "Gujrati Matrimony" },
    { id: "marathi", name: "Marathi Matrimony" },
  ];

  const statuses = [
    { id: "all", name: "All Status" },
    { id: "active", name: "Active Users" },
    { id: "restrict", name: "Restrict Users" },
    { id: "deleted", name: "Deleted Users" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader
        title="Admin Staff Management"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Staff" },
        ]}
        createButton={{
          href: "/admin/dashboard/users/create",
          label: "Create New Staff",
        }}
      />

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
                placeholder="Search admin staff by name..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">

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

            {/* <button className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              <svg className="mr-2 inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              More Filters
            </button> */}

            <button
              onClick={() => {
                setSearchTerm("");
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
        status={selectedStatus}
      />

    </div>
  );
}
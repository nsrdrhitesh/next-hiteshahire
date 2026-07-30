"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BlogTable from "../components/RoleTable";
import { Breadcrumb } from '../../components/ui/breadcrumb';
import PageHeader from "../../components/ui/PageHeader";

export default function AdminUserPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statuses = [
    { id: "all", name: "All Status" },
    { id: "1", name: "Active Platforms" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader
        title="Roles Management"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Staff", href: "/admin/dashboard/users" },
          { label: "Roles" },
        ]}
        createButton={{
          href: "/admin/dashboard/users/roles/create",
          label: "Create New Role",
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
          {/* <div className="flex flex-wrap gap-3">
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

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("all");
              }}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear All
            </button>
          </div> */}
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
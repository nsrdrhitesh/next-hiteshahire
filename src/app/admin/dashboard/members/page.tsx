"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MemberTable from "../members/components/MemberTable";
import { showSuccess, showError } from '../lib/swalHelper';
import { Breadcrumb } from '../components/ui/breadcrumb';

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function AdminUserPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    restrict: 0,
    deleted: 0
  });

  const statuses = [
    { id: "all", name: "All Status" },
    { id: "active", name: "Active Members" },
    { id: "restrict", name: "Restricted Members" },
    { id: "deleted", name: "Deleted Members" },
  ];

  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
    if (storedPermissions) {
      setPermissions(JSON.parse(storedPermissions));
    }
    
    // Fetch member stats
    fetchMemberStats();
  }, []);

  const fetchMemberStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
      
      const response = await fetch(`${API_URL}/member-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch member stats:", error);
    }
  };

  // 
  
  const moveToFieldsForm = () => {
      router.push("/admin/dashboard/members/fields");
  };

  const hasPermission = (resource: string, action: string) => {
    return permissions.some(
      (permission) =>
        permission.resource === resource &&
        permission.action === action
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Members' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Management</h1>
        </div>
        <div className="flex gap-3">
          {hasPermission("admin-member", "create") && (
            <Link
              href="/admin/dashboard/members/create/0/registration/step-1"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Member
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Members</h3>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Restricted Members</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.restrict}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Deleted Members</h3>
          <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{stats.deleted}</p>
        </div>
      </div> */}

      {/* Stats Cards - Updated with real data */}
      {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Restricted Members</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.restrict}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deleted Members</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.deleted}</p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div> */}

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
                placeholder="Search members by name, email, or mobile..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select> */}

            <button
              onClick={() => {
                moveToFieldsForm();
              }}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Edit Fields
            </button>

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

      {/* Member Table */}
      <MemberTable
        searchTerm={searchTerm}
        status={selectedStatus}
      />
    </div>
  );
}
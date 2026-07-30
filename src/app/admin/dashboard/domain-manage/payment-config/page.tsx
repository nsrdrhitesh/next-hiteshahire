"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DomainPaymentConfigTable from "../components/DomainPaymentConfigTable";
import { Breadcrumb } from '../../components/ui/breadcrumb';
import PageHeader from "../../components/ui/PageHeader";

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function DomainPaymentConfigPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
  }, []);

  const hasPermission = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  return (
    <div className="space-y-6">
      {/* Header */}

      <PageHeader
        title="Domain Payment Configuration"
        // description="Manage payment gateways per platform (Stripe, Razorpay, PayPal, etc.)"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
          { label: "Payment Config" },
        ]}
        createButton={{
          href: "/admin/dashboard/domain-manage/payment-config/create",
          label: "Add New Gateway",
          permission: { resource: "domain-payment-config", action: "create" }
        }}
        permissions={permissions}
      />

      {/* Search Filter */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
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
                placeholder="Search by gateway name..."
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSearchTerm("")}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <DomainPaymentConfigTable searchTerm={searchTerm} />
    </div>
  );
}
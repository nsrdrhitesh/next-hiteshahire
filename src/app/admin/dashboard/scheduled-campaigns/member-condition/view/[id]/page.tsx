
// View Page - D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\member-conditions\view\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  ArrowLeft,
  Users,
  Calendar,
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  Smartphone,
  CheckCircle,
  XCircle,
  Copy,
  Info
} from "lucide-react";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { showSuccess } from "../../../../lib/swalHelper";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface MemberCondition {
  id: number;
  platformId: number;
  name: string;
  gender: number[] | null;
  onBehalf: number[] | null;
  country: number[] | null;
  state: number[] | null;
  city: number[] | null;
  religion: number[] | null;
  caste: number[] | null;
  occupation: number[] | null;
  education: number[] | null;
  memberDeviceType: number[] | null;
  approveStatus: number[] | null;
  planPurchased: number[] | null;
  approveFromDate: string | null;
  approveToDate: string | null;
  memberFromDate: string | null;
  memberToDate: string | null;
  memberIncompleteFrom: number[] | null;
  maritalStatus: number[] | null;
  memberAgeMin: number;
  memberAgeMax: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

const GENDER_LABELS: Record<number, string> = { 1: "Bride", 2: "Groom" };
const ON_BEHALF_LABELS: Record<number, string> = { 1: "Myself", 2: "On behalf of someone else" };
const MARITAL_STATUS_LABELS: Record<number, string> = { 1: "Single", 2: "Divorced", 3: "Widowed" };
const APPROVE_STATUS_LABELS: Record<number, string> = { 1: "Approved", 2: "Pending" };
const DEVICE_TYPE_LABELS: Record<number, string> = { 1: "Android", 2: "iOS" };

export default function ViewMemberCondition() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [condition, setCondition] = useState<MemberCondition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);

  useEffect(() => {
    const fetchCondition = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/scheduled-campaigns/member-conditions/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load condition");

        const result = await res.json();
        setCondition(result);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCondition();
  }, [id, router, API_URL]);

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatArray = (arr: number[] | null, labelMap: Record<number, string>) => {
    if (!arr || arr.length === 0) return "All";
    return arr.map(v => labelMap[v]).join(", ");
  };

  const formatIdArray = (arr: number[] | null) => {
    if (!arr || arr.length === 0) return "All";
    return arr.join(", ");
  };

  const getAgeRange = () => {
    if (!condition) return "Any age";
    const { memberAgeMin, memberAgeMax } = condition;
    if (memberAgeMin === 0 && memberAgeMax === 0) return "Any age";
    if (memberAgeMin > 0 && memberAgeMax > 0) return `${memberAgeMin} - ${memberAgeMax} years`;
    if (memberAgeMin > 0) return `${memberAgeMin}+ years`;
    if (memberAgeMax > 0) return `Up to ${memberAgeMax} years`;
    return "Any age";
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await showSuccess(`${label} copied to clipboard`);
    } catch (err) {
      console.error("Failed to copy");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading condition details...</p>
        </div>
      </div>
    );
  }

  if (error || !condition) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Condition not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Member Condition Details"
        // description="View targeting rules for member segmentation"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Member Conditions", href: "/admin/dashboard/scheduled-campaigns/member-condition" },
          { label: "View" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/member-condition",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
            // No permission required for Back button
          },
          {
            href: `/admin/dashboard/scheduled-campaigns/member-condition/edit/${id}`,
            label: "Edit Member Condition",
            icon: <Edit className="h-4 w-4" />,
            variant: 'primary',
            permission: { 
              resource: "member-condition", 
              action: "edit"   // or "edit"
            }
          }
        ]}
        permissions={permissions}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Condition Name</p>
                <div className="mt-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {condition.name}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {condition.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    condition.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}>
                    {condition.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatArray(condition.gender, GENDER_LABELS)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">On Behalf</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatArray(condition.onBehalf, ON_BEHALF_LABELS)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Marital Status</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatArray(condition.maritalStatus, MARITAL_STATUS_LABELS)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Age Range</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{getAgeRange()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(condition.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(condition.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Demographics */}
          {(condition.religion?.length || condition.caste?.length) && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Demographics
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Religion IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.religion)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Caste IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.caste)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {(condition.country?.length || condition.state?.length || condition.city?.length) && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Location
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Country IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.country)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">State IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.state)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">City IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.city)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Education & Occupation */}
          {(condition.education?.length || condition.occupation?.length) && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Education & Occupation
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Education IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.education)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Occupation IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.occupation)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Device Type</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatArray(condition.memberDeviceType, DEVICE_TYPE_LABELS)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Plan Purchased IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.planPurchased)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date Ranges */}
          {(condition.approveFromDate || condition.memberFromDate) && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Date Ranges
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approval Date Range</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {condition.approveFromDate && condition.approveToDate
                      ? `${formatDate(condition.approveFromDate)} - ${formatDate(condition.approveToDate)}`
                      : condition.approveFromDate
                      ? `From ${formatDate(condition.approveFromDate)}`
                      : condition.approveToDate
                      ? `Until ${formatDate(condition.approveToDate)}`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Date Range</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {condition.memberFromDate && condition.memberToDate
                      ? `${formatDate(condition.memberFromDate)} - ${formatDate(condition.memberToDate)}`
                      : condition.memberFromDate
                      ? `From ${formatDate(condition.memberFromDate)}`
                      : condition.memberToDate
                      ? `Until ${formatDate(condition.memberToDate)}`
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Filters */}
          {(condition.approveStatus?.length || condition.memberIncompleteFrom?.length) && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Status Filters
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approval Status</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatArray(condition.approveStatus, APPROVE_STATUS_LABELS)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Incomplete Steps IDs</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatIdArray(condition.memberIncompleteFrom)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <ul className="space-y-2 text-sm">
              <li>• Use this condition in campaigns</li>
              <li>• Test condition before enabling</li>
              <li>• Monitor segment size</li>
              <li>• Adjust criteria as needed</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Usage Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Can be used in WhatsApp campaigns</li>
              <li>• Can be used in Push notifications</li>
              <li>• Multiple campaigns can use this condition</li>
              <li>• Updates affect all linked campaigns</li>
            </ul>
          </div>

          <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Condition Logic
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Multiple values use OR logic</li>
                  <li>• Different fields use AND logic</li>
                  <li>• Empty fields are ignored</li>
                  <li>• Date ranges are inclusive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
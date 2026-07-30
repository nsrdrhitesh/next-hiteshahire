
// Edit Page - D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\member-conditions\edit\[id]\page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import MemberConditionForm from "../../../components/MemberConditionForm";

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
}

export default function EditMemberCondition() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [condition, setCondition] = useState<MemberCondition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setCondition(result.data);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCondition();
  }, [id, router, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading condition data...</p>
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
      <PageHeader
        title="Edit Member Condition"
        // description={`Update targeting rules for ${condition.name}`}
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Member Conditions", href: "/admin/dashboard/scheduled-campaigns/member-condition" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/member-condition",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />

      <MemberConditionForm mode="edit" initialData={condition} conditionId={id as string} />
    </div>
  );
}

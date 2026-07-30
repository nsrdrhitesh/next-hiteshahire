// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\schedulers\edit\[id]\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SchedulerForm from "../../../components/SchedulerForm";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { ArrowLeft } from "lucide-react";

interface Scheduler {
  id: number;
  platformId: number;
  name: string;
  scheduleTime: string | null;
  scheduleDate: string | null;
  scheduleFromDate: string | null;
  scheduleToDate: string | null;
  afterRegistrationMin: string | null;
  afterApprovalMin: string | null;
  isActive: number;
}

export default function EditScheduler() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [scheduler, setScheduler] = useState<Scheduler | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduler = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/scheduled-campaigns/schedulers/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load scheduler");

        const result = await res.json();
        setScheduler(result.data);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchScheduler();
  }, [id, router, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading scheduler data...</p>
        </div>
      </div>
    );
  }

  if (error || !scheduler) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Scheduler not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Scheduler"
        // description={`Update scheduling rules for ${scheduler.name}`}
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Schedulers", href: "/admin/dashboard/scheduled-campaigns/schedulers" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/schedulers",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />
      <SchedulerForm mode="edit" initialData={scheduler} schedulerId={id as string} />
    </div>
  );
}
// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\push-notifications\edit\[id]\page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PushNotificationForm from "../../../components/PushNotificationForm";
import PageHeader from "../../../../components/ui/PageHeader";

interface PushNotification {
  id: number;
  platformId: number;
  name: string;
  schedulerId: number;
  conditionId: number;
  title: string;
  message: string;
  action: string | null;
  routeId: number;
  strchr: string | null;
  nImage: string | null;
  variables: string[] | null;
  isActive: number;
}

export default function EditPushNotification() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [notification, setNotification] = useState<PushNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/scheduled-campaigns/push-notifications/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load notification");

        const result = await res.json();
        setNotification(result.data);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNotification();
  }, [id, router, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notification data...</p>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Notification not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Push Notification"
        // description={`Update push notification template for ${notification.name}`}
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Push Notifications", href: "/admin/dashboard/scheduled-campaigns/push-notification" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/push-notification",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />

      <PushNotificationForm mode="edit" initialData={notification} notificationId={id as string} />
    </div>
  );
}
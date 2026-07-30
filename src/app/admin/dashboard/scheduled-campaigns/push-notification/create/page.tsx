// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\push-notifications\create\page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import PushNotificationForm from "../../components/PushNotificationForm";
import PageHeader from "../../../components/ui/PageHeader";

export default function CreatePushNotification() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Push Notification"
        // description="Create a new push notification template for automated campaigns"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Push Notifications", href: "/admin/dashboard/scheduled-campaigns/push-notification" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/push-notification",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />
      <PushNotificationForm mode="create" />
    </div>
  );
}
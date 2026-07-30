"use client";

import { ArrowLeft } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import SchedulerForm from "../../components/SchedulerForm";

export default function CreateScheduler() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Scheduler"
        // description="Configure scheduling rules for automated campaigns"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Schedulers", href: "/admin/dashboard/scheduled-campaigns/schedulers" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/schedulers",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />

      <SchedulerForm mode="create" />
    </div>
  );
}
// Create Page - D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\scheduled-campaigns\member-conditions\create\page.tsx
"use client";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { Breadcrumb } from "../../../components/ui/breadcrumb";
import MemberConditionForm from "../../components/MemberConditionForm";

export default function CreateMemberCondition() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Member Condition"
        // description="Define targeting rules for member segmentation"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "Member Conditions", href: "/admin/dashboard/scheduled-campaigns/member-condition" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/member-condition",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />

      <MemberConditionForm mode="create" />
    </div>
  );
}

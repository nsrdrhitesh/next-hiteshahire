// Create Page - D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\whatsapp-messages\create\page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "../../../components/ui/breadcrumb";
import PageHeader from "../../../components/ui/PageHeader";
import WhatsAppMessageForm from "../../components/WhatsAppMessageForm";

export default function CreateWhatsAppMessage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create WhatsApp Message"
        // description={`Update scheduling rules for ${scheduler.name}`}
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "WhatsApp Messages", href: "/admin/dashboard/scheduled-campaigns/whatsapp-messages" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/whatsapp-messages",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />

      <WhatsAppMessageForm mode="create" />
    </div>
  );
}

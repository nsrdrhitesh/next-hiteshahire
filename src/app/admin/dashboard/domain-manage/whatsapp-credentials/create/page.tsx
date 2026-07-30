"use client";

import { Breadcrumb } from "../../../components/ui/breadcrumb";
import WhatsAppCredentialForm from "../../components/WhatsAppCredentialForm";

export default function CreateWhatsAppCredential() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
            { label: "WhatsApp Credentials", href: "/admin/dashboard/domain-manage/whatsapp-credentials" },
            { label: "Create" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create WhatsApp Credential
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add new WhatsApp Business API credentials for your platform
        </p>
      </div>

      <WhatsAppCredentialForm mode="create" />
    </div>
  );
}